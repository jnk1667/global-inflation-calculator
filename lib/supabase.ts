import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createClientFunction() {
  return supabase
}

// Server-side client for admin operations
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Type definitions
export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SEOContent {
  id: string
  title: string
  content: string
  meta_description?: string
  keywords?: string[]
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: string
  site_name: string
  site_description: string
  logo_url?: string
  contact_email?: string
  social_links?: any
  created_at: string
  updated_at: string
}

export interface UsageStats {
  id: string
  total_calculations: number
  monthly_calculations: number
  popular_currencies: any
  last_updated: string
}

export interface AboutContent {
  id: string
  section: "project" | "admin"
  title: string
  content: string
  social_links: Array<{
    platform: string
    url: string
    icon: string
  }>
  created_at: string
  updated_at: string
}

export interface LegacyPlannerContent {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

// Helper functions
export const getFAQs = async () => {
  const { data, error } = await supabase.from("faqs").select("*").eq("is_active", true).order("order_index")

  if (error) throw error
  return data as FAQ[]
}

export const getSEOContent = async (id: string) => {
  const { data, error } = await supabase.from("seo_content").select("*").eq("id", id).single()

  if (error) throw error
  return data as SEOContent
}

export const getSiteSettings = async () => {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "main").single()

  if (error) throw error
  return data as SiteSettings
}

export const getUsageStats = async () => {
  const { data, error } = await supabase.from("usage_stats").select("*").eq("id", "main").single()

  if (error) throw error
  return data as UsageStats
}

export const getAboutContent = async () => {
  const { data, error } = await supabase.from("about_content").select("*").order("section")

  if (error) throw error
  return data as AboutContent[]
}

export const updateAboutContent = async (id: string, updates: Partial<AboutContent>) => {
  const { data, error } = await supabase.from("about_content").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as AboutContent
}

export const getLegacyPlannerContent = async () => {
  const { data, error } = await supabase.from("legacy_planner_content").select("*").eq("id", "main").single()

  if (error) throw error
  return data as LegacyPlannerContent
}

export const updateLegacyPlannerContent = async (title: string, content: string) => {
  const { data, error } = await supabase
    .from("legacy_planner_content")
    .upsert({
      id: "main",
      title: title,
      content: content,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as LegacyPlannerContent
}
