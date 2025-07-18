import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.globalinflationcalculator.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-manage-content"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
