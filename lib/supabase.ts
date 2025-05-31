import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Contact = {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  status: "online" | "offline" | "busy"
  last_seen: string
  is_favorite: boolean
  created_at: string
}

export type CallHistory = {
  id: string
  caller_id: string
  receiver_id: string
  call_type: "video" | "audio"
  duration: number
  status: "completed" | "missed" | "declined"
  started_at: string
  ended_at?: string
}
