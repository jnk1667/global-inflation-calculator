import { notFound } from 'next/navigation'

export const revalidate = 86400 // Cache 404 pages for 24 hours

export default function NotFoundCatchAll() {
  notFound()
}
