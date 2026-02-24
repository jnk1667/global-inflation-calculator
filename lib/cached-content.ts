// Cached content loader to reduce Supabase requests
// Content is cached in localStorage for 24 hours to dramatically reduce edge requests

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const CACHE_VERSION = "v3" // Increment to invalidate all caches

interface CachedData<T> {
  data: T
  timestamp: number
  version: string
}

function getCacheKey(key: string): string {
  return `cached_content_${key}`
}

function isCacheValid(cached: CachedData<any> | null): boolean {
  if (!cached) return false
  if (cached.version !== CACHE_VERSION) return false
  const age = Date.now() - cached.timestamp
  return age < CACHE_DURATION
}

export async function getCachedContent<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Try to get from localStorage cache first
  if (typeof window !== "undefined") {
    try {
      const cacheKey = getCacheKey(key)
      const cachedStr = localStorage.getItem(cacheKey)
      
      if (cachedStr) {
        const cached: CachedData<T> = JSON.parse(cachedStr)
        
        if (isCacheValid(cached)) {
          console.log(`[Cache Hit] Loaded ${key} from cache`)
          return cached.data
        }
      }
    } catch (error) {
      console.warn(`[Cache] Error reading cache for ${key}:`, error)
    }
  }

  // Cache miss or invalid - fetch fresh data
  console.log(`[Cache Miss] Fetching fresh data for ${key}`)
  const data = await fetcher()

  // Only cache if we got meaningful content (not empty/default)
  const isDefaultContent =
    typeof data === "string" &&
    (data as string).trim().length < 200

  if (typeof window !== "undefined" && !isDefaultContent) {
    try {
      const cacheKey = getCacheKey(key)
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      }
      localStorage.setItem(cacheKey, JSON.stringify(cached))
    } catch (error) {
      console.warn(`[Cache] Error writing cache for ${key}:`, error)
    }
  }

  return data
}

export function clearCache(key?: string): void {
  if (typeof window === "undefined") return

  if (key) {
    // Clear specific cache
    const cacheKey = getCacheKey(key)
    localStorage.removeItem(cacheKey)
    console.log(`[Cache] Cleared cache for ${key}`)
  } else {
    // Clear all cached content
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(k => k.startsWith("cached_content_"))
    cacheKeys.forEach(k => localStorage.removeItem(k))
    console.log(`[Cache] Cleared all cached content (${cacheKeys.length} items)`)
  }
}

export function getCacheStats(): {
  totalItems: number
  totalSize: number
  items: Array<{ key: string; age: number; size: number }>
} {
  if (typeof window === "undefined") {
    return { totalItems: 0, totalSize: 0, items: [] }
  }

  const keys = Object.keys(localStorage)
  const cacheKeys = keys.filter(k => k.startsWith("cached_content_"))
  
  let totalSize = 0
  const items = cacheKeys.map(key => {
    const value = localStorage.getItem(key) || ""
    const size = value.length
    totalSize += size
    
    try {
      const cached = JSON.parse(value)
      const age = Date.now() - cached.timestamp
      return { key, age, size }
    } catch {
      return { key, age: 0, size }
    }
  })

  return {
    totalItems: items.length,
    totalSize,
    items,
  }
}
