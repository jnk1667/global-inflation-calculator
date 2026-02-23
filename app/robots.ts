import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Major search engines - full access, no delays
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "Baiduspider", "YandexBot", "Brave-Search"],
        allow: "/",
        disallow: ["/admin-manage-content/", "/api/"],
      },
      {
        // Block AI/LLM crawlers
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "anthropic-ai",
          "Applebot-Extended",
          "PerplexityBot",
          "Bytespider",
          "CCBot",
          "cohere-ai",
          "Diffbot",
          "ImagesiftBot",
          "omgili",
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
