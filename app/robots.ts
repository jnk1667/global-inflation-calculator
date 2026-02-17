import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin-manage-content/", "/api/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "anthropic-ai",
          "Applebot-Extended",
          "PerplexityBot",
          "Bytespider",
          "FacebookBot",
          "Diffbot",
          "ImagesiftBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://globalinflationcalculator.com/sitemap.xml",
  }
}
