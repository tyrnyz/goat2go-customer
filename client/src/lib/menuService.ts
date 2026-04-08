import { supabase } from './supabase'
import type { DbProduct, DbAddon } from '@/types/database'

export async function fetchProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'AVAILABLE')
    .eq('is_current', true)
    .order('productID', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchAddons(): Promise<DbAddon[]> {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .eq('is_available', true)

  if (error) throw error
  return data ?? []
}

export async function fetchBestSellers(limit: number = 3): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .rpc('get_best_sellers', { p_limit: limit })
  if (error) throw error
  return (data ?? []) as DbProduct[]
}
