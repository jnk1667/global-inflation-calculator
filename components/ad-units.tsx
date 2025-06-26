"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

// Banner Ad Component (728x90 or responsive)
export function BannerAd({
  adSlot,
  className = "w-full h-24",
}: {
  adSlot: string
  className?: string
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null
  }

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Square Ad Component (300x250)
export function SquareAd({
  adSlot,
  className = "w-80 h-64",
}: {
  adSlot: string
  className?: string
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null
  }

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: "300px", height: "250px" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
      />
    </div>
  )
}

// Sidebar Ad Component (160x600)
export function SidebarAd({
  adSlot,
  className = "w-40 h-96",
}: {
  adSlot: string
  className?: string
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null
  }

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: "160px", height: "600px" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
      />
    </div>
  )
}
