import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"
  const now = new Date().toISOString().split("T")[0]

  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
    { loc: baseUrl,                                                                    lastmod: now, changefreq: "daily",   priority: "1.0" },
    { loc: `${baseUrl}/salary-calculator`,                                             lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/salary-calculator/regional-cost-of-living`,                    lastmod: now, changefreq: "weekly",  priority: "0.8" },
    { loc: `${baseUrl}/retirement-calculator`,                                         lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/deflation-calculator`,                                          lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/shrinkflation-calculator`,                                      lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/legacy-planner`,                                                lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/student-loan-calculator`,                                       lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/mortgage-calculator`,                                           lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/home-affordability-calculator/inflation-adjusted`,              lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/auto-loan-calculator`,                                          lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/emergency-fund-calculator`,                                     lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/budget-calculator`,                                             lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/roi-calculator`,                                                lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/ppp-calculator`,                                                lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/insurance-inflation-calculator`,                                lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/global-net-worth-calculator`,                                   lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/global-compound-interest`,                                      lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/investment-race-calculator`,                                    lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/energy-inflation-calculator`,                                   lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/charts`,                                                        lastmod: now, changefreq: "weekly",  priority: "0.9" },
    { loc: `${baseUrl}/about`,                                                         lastmod: now, changefreq: "monthly", priority: "0.6" },
    { loc: `${baseUrl}/llms.txt`,                                                      lastmod: now, changefreq: "monthly", priority: "0.5" },
    { loc: `${baseUrl}/sitemap.xml`,                                                   lastmod: now, changefreq: "monthly", priority: "0.5" },
    { loc: `${baseUrl}/accessibility`,                                                 lastmod: now, changefreq: "monthly", priority: "0.5" },
    { loc: `${baseUrl}/privacy`,                                                       lastmod: now, changefreq: "yearly",  priority: "0.3" },
    { loc: `${baseUrl}/terms`,                                                         lastmod: now, changefreq: "yearly",  priority: "0.3" },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
