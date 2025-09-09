import type { Metadata } from "next"
import AdminContentPage from "./AdminContentPage"

export const metadata: Metadata = {
  title: "Admin Dashboard - Global Inflation Calculator",
  description: "Content management dashboard for Global Inflation Calculator",
  robots: "noindex, nofollow",
}

export default function AdminPage() {
  return <AdminContentPage />
}
