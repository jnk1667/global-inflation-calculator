"use client"

import { useEffect } from "react"

interface AdBannerProps {
  size?: "small" | "medium" | "large"
  position?: "top" | "bottom" | "sidebar"
  className?: string
  slot?: string
  format?: "horizontal" | "square" | "vertical"
}

export default function AdBanner({ size = "medium", position = "top", className = "", slot = "5048747585" }: AdBannerProps) {
  // Fixed dimensions to prevent CLS - using explicit pixel heights
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { minHeight: "80px", height: "80px", maxWidth: "384px" }
      case "large":
        return { minHeight: "192px", height: "192px", maxWidth: "896px" }
      default:
        return { minHeight: "128px", height: "128px", maxWidth: "672px" }
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case "sidebar":
        return "sticky top-4"
      case "bottom":
        return "mt-8"
      default:
        return "mb-8"
    }
  }

  const sizeStyles = getSizeStyles()

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Wait for container to be properly sized before pushing ad
        const timer = setTimeout(() => {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
        }, 100)
        return () => clearTimeout(timer)
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div 
      className={`${getPositionClasses()} ${className} w-full mx-auto`}
      style={{ 
        minHeight: sizeStyles.minHeight,
        maxWidth: sizeStyles.maxWidth,
        width: '100%'
      }}
    >
      <div 
        className="w-full flex items-center justify-center"
        style={{ minHeight: sizeStyles.minHeight, width: '100%' }}
      >
        {/* Google AdSense Ad Unit */}
        <ins 
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: sizeStyles.minHeight }}
          data-ad-client="ca-pub-9295410934525516"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
