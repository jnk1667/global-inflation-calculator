"use client"

interface AdBannerProps {
  size?: "small" | "medium" | "large"
  position?: "top" | "bottom" | "sidebar"
  className?: string
  slot?: string
  format?: "horizontal" | "square" | "vertical"
}

export default function AdBanner({ size = "medium", position = "top", className = "" }: AdBannerProps) {
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

  return (
    <div 
      className={`${getPositionClasses()} ${className} w-full mx-auto`}
      style={{ 
        minHeight: sizeStyles.minHeight,
        height: sizeStyles.height,
        maxWidth: sizeStyles.maxWidth,
        containIntrinsicSize: `${sizeStyles.maxWidth} ${sizeStyles.height}`,
        contentVisibility: "auto"
      }}
    >
      <div 
        className="h-full w-full bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 rounded-lg flex items-center justify-center"
        style={{ minHeight: sizeStyles.minHeight }}
      >
        {/* Google Ads will be injected here */}
        <div className="text-xs text-gray-400 dark:text-gray-500 opacity-50">Advertisement</div>
      </div>
    </div>
  )
}
