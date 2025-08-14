"use client"

import { useEffect } from "react"

interface AdBannerProps {
  slot?: string
  format?: "horizontal" | "vertical" | "square"
  className?: string
}

export default function AdBanner({
  slot = "retirement-calculator-default",
  format = "horizontal",
  className = "",
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && window.adsbygoogle) {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  const getAdDimensions = () => {
    switch (format) {
      case "horizontal":
        return "min-h-[90px] md:min-h-[250px]"
      case "vertical":
        return "min-h-[600px] w-[160px] md:w-[300px]"
      case "square":
        return "min-h-[250px] md:min-h-[300px]"
      default:
        return "min-h-[90px] md:min-h-[250px]"
    }
  }

  return (
    <div
      className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${getAdDimensions()} ${className}`}
    >
      <div className="text-center text-gray-500 dark:text-gray-400">
        <div className="text-sm font-medium mb-1">Advertisement Space</div>
        <div className="text-xs">AdSense will appear here</div>
        {process.env.NODE_ENV === "production" && (
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  )
}
