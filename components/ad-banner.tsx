"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface AdBannerProps {
  slot: string
  format?: "horizontal" | "square" | "vertical"
  className?: string
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, format = "horizontal", className = "" }) => {
  const adRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    if (!clientId) {
      console.log("AdSense client ID not configured")
      return
    }

    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement("script")
        script.async = true
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        script.crossOrigin = "anonymous"
        document.head.appendChild(script)
      }

      // Initialize ad after a short delay
      const timer = setTimeout(() => {
        if (window.adsbygoogle && adRef.current) {
          try {
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          } catch (err) {
            console.log("AdSense error:", err)
          }
        }
      }, 100)

      return () => clearTimeout(timer)
    } catch (err) {
      console.log("AdSense initialization error:", err)
    }
  }, [clientId])

  if (!clientId) {
    // Show placeholder when AdSense is not configured
    const placeholderHeight = format === "square" ? "h-64" : format === "vertical" ? "h-96" : "h-24"
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${placeholderHeight} ${className}`}
      >
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium">Advertisement Space</div>
          <div className="text-xs">AdSense will appear here</div>
        </div>
      </div>
    )
  }

  const getAdSize = () => {
    switch (format) {
      case "square":
        return { width: "300", height: "250" }
      case "vertical":
        return { width: "160", height: "600" }
      default:
        return { width: "728", height: "90" }
    }
  }

  const { width, height } = getAdSize()

  return (
    <div ref={adRef} className={`text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: `${width}px`, height: `${height}px` }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default AdBanner
