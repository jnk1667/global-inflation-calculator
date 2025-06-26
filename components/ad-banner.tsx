"use client"

import { useEffect, useRef } from "react"

interface AdBannerProps {
  slot: string
  format: "horizontal" | "vertical" | "square"
  className?: string
}

export default function AdBanner({ slot, format, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only initialize if we have a valid AdSense client ID
    if (
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID &&
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID !== "ca-pub-xxxxxxxxxxxxxxxx" &&
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID.startsWith("ca-pub-")
    ) {
      try {
        if (typeof window !== "undefined" && window.adsbygoogle && window.adsbygoogle.push) {
          window.adsbygoogle.push({})
        }
      } catch (error) {
        console.warn("AdSense loading error:", error)
      }
    }
  }, [])

  const getAdDimensions = () => {
    switch (format) {
      case "horizontal":
        return { width: "100%", height: "90px", "data-ad-format": "horizontal" }
      case "vertical":
        return { width: "160px", height: "600px", "data-ad-format": "vertical" }
      case "square":
        return { width: "300px", height: "250px", "data-ad-format": "rectangle" }
      default:
        return { width: "100%", height: "90px", "data-ad-format": "auto" }
    }
  }

  const dimensions = getAdDimensions()

  // Don't render ads if no valid client ID is configured
  if (
    !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID === "ca-pub-xxxxxxxxxxxxxxxx" ||
    !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID.startsWith("ca-pub-")
  ) {
    return (
      <div className={`ad-placeholder ${className}`} ref={adRef}>
        <div className="text-xs text-gray-400 text-center mb-1">Advertisement Space</div>
        <div
          className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          Ad Space ({format})
        </div>
      </div>
    )
  }

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <div className="text-xs text-gray-400 text-center mb-1">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: dimensions.width,
          height: dimensions.height,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={`your-ad-slot-${slot}`}
        data-ad-format={dimensions["data-ad-format"]}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Extend window type for AdSense
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
