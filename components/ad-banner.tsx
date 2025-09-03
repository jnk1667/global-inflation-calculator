"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"

interface AdBannerProps {
  size?: "small" | "medium" | "large"
  position?: "top" | "bottom" | "sidebar"
  className?: string
}

export default function AdBanner({ size = "medium", position = "top", className = "" }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [adContent, setAdContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate ad loading
    const loadAd = async () => {
      try {
        setLoading(true)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock ad content based on size
        const mockAds = {
          small: {
            title: "Financial Planning Tools",
            description: "Discover professional financial calculators",
            image: "/placeholder.svg?height=60&width=120&text=Ad",
            link: "#",
            sponsor: "FinanceTools Pro",
          },
          medium: {
            title: "Investment Calculator",
            description:
              "Calculate your investment returns with our advanced tools. Start planning your financial future today.",
            image: "/placeholder.svg?height=120&width=300&text=Investment+Ad",
            link: "#",
            sponsor: "InvestSmart",
          },
          large: {
            title: "Retirement Planning Made Easy",
            description:
              "Plan your retirement with confidence using our comprehensive suite of financial tools and calculators. Get started with a free consultation.",
            image: "/placeholder.svg?height=200&width=600&text=Retirement+Planning",
            link: "#",
            sponsor: "RetirePlan Pro",
          },
        }

        setAdContent(mockAds[size])
      } catch (error) {
        console.error("Failed to load ad:", error)
        setAdContent(null)
      } finally {
        setLoading(false)
      }
    }

    loadAd()
  }, [size])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleClick = () => {
    if (adContent?.link) {
      // Track ad click
      console.log("Ad clicked:", adContent.title)
      // In a real app, you would track this event
    }
  }

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

  if (!isVisible) {
    return null
  }

  if (loading) {
    return (
      <div className={`${getSizeClasses()} ${getPositionClasses()} ${className}`}>
        <Card className="h-full">
          <CardContent className="h-full flex items-center justify-center">
            <div className="animate-pulse flex items-center space-x-4 w-full">
              <div className="rounded bg-gray-200 dark:bg-gray-700 h-12 w-12 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!adContent) {
    return null
  }

  return (
    <div className={`${getSizeClasses()} ${getPositionClasses()} ${className} relative`}>
      <Card className="h-full border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
        <CardContent className="h-full p-4 relative">
          {/* Close button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Ad content */}
          <div className="h-full flex items-center space-x-4 cursor-pointer group" onClick={handleClick}>
            {/* Ad image */}
            <div className="flex-shrink-0">
              <img
                src={adContent.image || "/placeholder.svg"}
                alt={adContent.title}
                className="rounded object-cover"
                style={{
                  width: size === "small" ? "60px" : size === "large" ? "120px" : "80px",
                  height: size === "small" ? "40px" : size === "large" ? "80px" : "60px",
                }}
              />
            </div>

            {/* Ad text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {adContent.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{adContent.description}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-500">Sponsored by {adContent.sponsor}</span>
                    <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ad label */}
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 py-0.5 rounded">
              Ad
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
