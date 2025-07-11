"use client"

import type React from "react"
import { useEffect } from "react"

interface AdBannerProps {
  slot?: string
  format?: "horizontal" | "square" | "vertical"
  className?: string
}

const AdBanner: React.FC<AdBannerProps> = ({ slot = "default", format = "horizontal", className = "" }) => {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
      try {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.log("AdSense error:", error)
      }
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-sm">Advertisement Space</div>
          <div className="text-xs mt-1">AdSense not configured</div>
        </div>
      </div>
    )
  }

  const getAdSize = () => {
    switch (format) {
      case "square":
        return { width: 300, height: 250 }
      case "vertical":
        return { width: 160, height: 600 }
      default:
        return { width: 728, height: 90 }
    }
  }

  const { width, height } = getAdSize()

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

export default AdBanner
