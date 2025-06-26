import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-manage-content"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
