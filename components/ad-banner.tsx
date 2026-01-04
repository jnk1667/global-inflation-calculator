"use client"

interface AdBannerProps {
  size?: "small" | "medium" | "large"
  position?: "top" | "bottom" | "sidebar"
  className?: string
  slot?: string
  format?: "horizontal" | "square" | "vertical"
}

export default function AdBanner({ size = "medium", position = "top", className = "" }: AdBannerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-20 max-w-sm"
      case "large":
        return "h-48 max-w-4xl"
      default:
        return "h-32 max-w-2xl"
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

  return (
    <div className={`${getSizeClasses()} ${getPositionClasses()} ${className} w-full mx-auto`}>
      <div className="h-full w-full bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 rounded-lg flex items-center justify-center">
        {/* Google Ads will be injected here */}
        <div className="text-xs text-gray-400 dark:text-gray-500 opacity-50">Advertisement</div>
      </div>
    </div>
  )
}
