import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.globalinflationcalculator.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      images: ["https://www.globalinflationcalculator.com/og-image.jpg"],
    },
    {
      url: "https://www.globalinflationcalculator.com/admin-manage-content",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ]
}
