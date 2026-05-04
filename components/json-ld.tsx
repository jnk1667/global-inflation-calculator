"use client"

import { useEffect } from "react"

interface JsonLdProps {
  id: string
  data: Record<string, unknown>
}

export function JsonLd({ id, data }: JsonLdProps) {
  useEffect(() => {
    const existing = document.getElementById(id)
    if (existing) existing.remove()

    const script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    script.text = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }
  }, [id, data])

  return null
}
