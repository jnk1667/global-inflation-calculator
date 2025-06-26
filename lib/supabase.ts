import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface FAQ {
  id: string
  question: string
  answer: string
  created_at?: string
  updated_at?: string
}

export interface SiteSettings {
  id: string
  title: string
  description: string
  keywords: string
  contact_email: string
  updated_at?: string
}
