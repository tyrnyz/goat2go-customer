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
}

export async function placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
  const { data: rpcResult, error } = await supabase
    .rpc('place_customer_order', {
      p_session_id: params.sessionId,
      p_order_type: params.orderType,
      p_discount_type: params.discountType,
      p_items: params.items,
    })

  if (error) throw error

  if (!rpcResult.success) {
    if (rpcResult.error === 'rate_limit_exceeded') {
      throw new Error('You have placed too many orders. Please wait a few minutes before trying again.')
    }
    if (rpcResult.error === 'unavailable_products') {
      throw new Error(`The following items are no longer available: ${(rpcResult.products as string[]).join(', ')}`)
    }
    throw new Error('Failed to place order')
  }

  return {
    orderID: rpcResult.orderID,
    queueNumber: rpcResult.queueNumber,
  }
}

export async function fetchOrderById(orderId: number, sessionId: string): Promise<DbOrder | null> {
  const { data, error } = await supabase
    .rpc('fetch_customer_order_by_id', {
      p_order_id: orderId,
      p_session_id: sessionId,
    })

  if (error || !data) return null
  return data as DbOrder
}

export async function fetchOrderItems(orderId: number, sessionId: string): Promise<DbOrderItem[]> {
  const { data, error } = await supabase
    .rpc('fetch_customer_order_items', {
      p_order_id: orderId,
      p_session_id: sessionId,
    })

  if (error) throw error
  return (data ?? []) as DbOrderItem[]
}

export async function fetchOrdersBySession(sessionId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .rpc('fetch_customer_orders', {
      p_session_id: sessionId,
    })

  if (error) throw error
  return (data ?? []) as DbOrder[]
}
