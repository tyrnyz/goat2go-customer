import { supabase } from './supabase'
import type { DbOrder, DbOrderItem } from '@/types/database'

interface PlaceOrderParams {
  sessionId: string
  orderType: 'Dine-In' | 'Take-Out'
  discountType: 'None' | 'PWD' | 'Senior'
  items: Array<{
    productId: number
    quantity: number
    price: number
    selectedAddons: Array<{ id: string; name: string; price: number }>
  }>
}

export interface PlaceOrderResult {
  orderID: number
  queueNumber: string
  orderTimestamp: string
}

export async function placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
  // 1. Look up current product_sid for each productID
  const productIds = params.items.map(i => i.productId)
  const { data: currentProducts } = await supabase
    .from('products')
    .select('"productID", product_sid')
    .eq('is_current', true)
    .in('"productID"', productIds)

  const sidMap = new Map<number, number>(
    currentProducts?.map(p => [p.productID, p.product_sid]) ?? []
  )

  // 2. Create order via RPC (bypasses INSERT+RETURNING RLS issue)
  const { data: rpcResult, error: orderError } = await supabase
    .rpc('place_customer_order', {
      p_session_id: params.sessionId,
      p_order_type: params.orderType,
      p_discount_type: params.discountType,
    })

  if (orderError || !rpcResult) throw orderError || new Error('Failed to create order')

  const order = rpcResult as PlaceOrderResult

  // 3. Insert order items with product_sid
  const orderItems = params.items.map(item => ({
    orderID: order.orderID,
    productID: item.productId,
    product_sid: sidMap.get(item.productId) ?? null,
    quantity: item.quantity,
    price: item.price,
    selectedAddons: item.selectedAddons,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return {
    orderID: order.orderID,
    queueNumber: order.queueNumber,
    orderTimestamp: order.orderTimestamp,
  }
}

export async function fetchOrderById(orderId: number): Promise<DbOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('orderID', orderId)
    .single()

  if (error) return null
  return data
}

export async function fetchOrderItems(orderId: number): Promise<DbOrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('orderID', orderId)

  if (error) return []
  return data ?? []
}

export async function fetchOrdersBySession(sessionId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('sessionID', sessionId)
    .order('orderTimestamp', { ascending: false })

  if (error) return []
  return data ?? []
}

export function subscribeToOrder(orderId: number, callback: (order: DbOrder) => void) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `orderID=eq.${orderId}`,
      },
      (payload) => callback(payload.new as DbOrder)
    )
    .subscribe()
}
