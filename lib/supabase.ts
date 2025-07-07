import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Add debugging
console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key (first 20 chars):", supabaseAnonKey?.substring(0, 20) + "...")

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

export interface SEOContent {
  id: string
  content: string
  updated_at?: string
}
