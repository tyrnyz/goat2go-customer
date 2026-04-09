// Matches SE2 shared Supabase schema — column names are camelCase

export interface DbProduct {
  productID: number
  product_sid: number
  productName: string
  price: number
  status: 'AVAILABLE' | 'UNAVAILABLE'
  type: 'Vegetable' | 'Meat' | 'Fish' | 'Others' | 'Drinks'
  image_path: string | null
  description: string | null
  is_best_seller: boolean
  is_current: boolean
}

export interface DbAddon {
  id: string
  name: string
  price: number
  is_available: boolean
}

export interface DbOrder {
  orderID: number
  userID: number | null
  sessionID: string | null
  orderType: 'Dine-In' | 'Take-Out'
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled'
  orderTimestamp: string
  completeTimestamp: string | null
  paymentstatus: 'Paid' | 'Unpaid'
  queueNumber: string | null
  discountType: 'None' | 'PWD' | 'Senior'
  cancelled_at: string | null
  cancelled_by: 'customer' | 'staff' | 'system' | null
}

export interface DbOrderItem {
  orderItemID: number
  orderID: number
  productID: number
  product_sid: number | null
  quantity: number
  price: number
  selectedAddons: Array<{
    id: string
    name: string
    price: number
  }>
}

export interface DbGuestSession {
  id: string
  created_at: string
  expires_at: string
}
