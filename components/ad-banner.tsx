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
    // Initialize Google AdSense
    try {
      if (typeof window !== "undefined" && window.adsbygoogle && window.adsbygoogle.push) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      // Silently handle AdSense loading errors
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

  if (!slot) {
    return null
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
        data-ad-client="ca-pub-YOUR-ADSENSE-ID"
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
