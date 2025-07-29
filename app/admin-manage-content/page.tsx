import type { Metadata } from "next"
import AdminContentPage from "./AdminContentPage"

export const metadata: Metadata = {
  title: "Admin Dashboard - Global Inflation Calculator",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminPage() {
  return <AdminContentPage />
}
