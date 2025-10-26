import type { Metadata } from "next"
import AdminBlogPage from "./AdminBlogPage"

export const metadata: Metadata = {
  title: "Blog Admin - Global Inflation Calculator",
  description: "Blog management dashboard for Global Inflation Calculator",
  robots: "noindex, nofollow",
}

export default function BlogAdminPage() {
  return <AdminBlogPage />
}
