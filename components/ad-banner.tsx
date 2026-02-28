"use client"

import { useEffect, useRef } from "react"

interface AdBannerProps {
  size?: "small" | "medium" | "large"
  position?: "top" | "bottom" | "sidebar"
  className?: string
  slot?: string
  format?: "horizontal" | "square" | "vertical"
}

export default function AdBanner({ size = "medium", position = "top", className = "", slot = "5048747585" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)

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
    if (typeof window === "undefined" || pushed.current) return

    const container = containerRef.current
    if (!container) return

    const tryPush = () => {
      if (pushed.current) return
      const width = container.getBoundingClientRect().width
      if (width > 0) {
        pushed.current = true
        try {
          ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
        } catch (err) {
          // Ignore duplicate push errors in development
        }
      }
    }

    // Try immediately in case layout is already complete
    tryPush()

    if (!pushed.current) {
      // Fall back to ResizeObserver to wait for a real non-zero width
      const observer = new ResizeObserver(() => {
        tryPush()
        if (pushed.current) observer.disconnect()
      })
      observer.observe(container)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`${getPositionClasses()} ${className} w-full mx-auto`}
      style={{
        minHeight: sizeStyles.minHeight,
        maxWidth: sizeStyles.maxWidth,
        width: "100%",
      }}
    >
      <div
        className="w-full flex items-center justify-center"
        style={{ minHeight: sizeStyles.minHeight, width: "100%" }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: sizeStyles.minHeight }}
          data-ad-client="ca-pub-9295410934525516"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
