import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Major search engines + AI search (users discover your site through these)
        userAgent: [
          "Googlebot", 
          "Bingbot", 
          "Slurp", 
          "DuckDuckBot", 
          "Baiduspider", 
          "YandexBot", 
          "Brave-Search",
          "PerplexityBot",      // Perplexity AI search - users search here
          "Applebot-Extended",  // Apple Intelligence/Siri - users ask questions
        ],
        allow: "/",
        disallow: ["/admin-manage-content/", "/api/"],
      },
      {
        // Block AI training/scraping crawlers (no user benefit, just consume resources)
        userAgent: [
          "GPTBot",           // OpenAI training
          "ChatGPT-User",     // ChatGPT browsing
          "Claude-Web",       // Anthropic training
          "anthropic-ai",     // Anthropic training
          "Bytespider",       // ByteDance (TikTok) - very aggressive
          "CCBot",            // Common Crawl - training data
          "cohere-ai",        // Cohere training
          "Diffbot",          // Data extraction
          "ImagesiftBot",     // Image scraping
          "omgili",           // Content aggregation
        ],
        disallow: ["/"],
      },
      {
        // Block aggressive SEO crawlers
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "BLEXBot",
          "DataForSeoBot",
          "PetalBot",
          "Seekport",
          "ZoominfoBot",
        ],
        disallow: ["/"],
      },
      {
        // All other bots
        userAgent: "*",
        allow: "/",
        disallow: ["/admin-manage-content/", "/api/"],
      },
    ],
    sitemap: "https://www.globalinflationcalculator.com/sitemap.xml",
  }
}
