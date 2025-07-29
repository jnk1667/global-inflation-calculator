import type { Metadata } from "next"
import AdminContentPage from "./AdminContentPage"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Admin Dashboard - Global Inflation Calculator | Content Management",
  description: "Admin dashboard for managing content, FAQs, and site settings for the Global Inflation Calculator.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/admin-manage-content`,
  },
}

export default function AdminPage() {
  return <AdminContentPage />
}
