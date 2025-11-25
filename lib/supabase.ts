import { createClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set")
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    const client = getSupabaseClient()
    return client[prop as keyof typeof client]
  },
})

export function createClientFunction() {
  return getSupabaseClient()
}

// Server-side client for admin operations
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are not set")
  }

  return createClient(supabaseUrl, serviceRoleKey)
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

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  meta_description: string
  keywords: string[]
  author: string
  featured_image_url: string
  category: string
  tags: string[]
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  view_count: number
  reading_time_minutes: number
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

export const getBlogPosts = async (publishedOnly = true) => {
  let query = supabase.from("blog_posts").select("*").order("published_at", { ascending: false })

  if (publishedOnly) {
    query = query.eq("is_published", true)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BlogPost[]
}

export const getBlogPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) throw error
  return data as BlogPost
}
