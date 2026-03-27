import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const customHeaders: Record<string, string> = {}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: customHeaders },
})

export function setSessionHeader(sessionId: string) {
  customHeaders['x-session-id'] = sessionId
}
