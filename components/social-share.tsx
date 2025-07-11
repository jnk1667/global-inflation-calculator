"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle } from "lucide-react"

const SocialShare: React.FC = () => {
  const siteUrl = typeof window !== "undefined" ? window.location.href : "https://globalinflationcalculator.com"
  const shareText =
    "Check out this Global Inflation Calculator - track how inflation affects your money across different currencies from 1913 to now!"

  const handleShare = async (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(siteUrl)

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "reddit":
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
        break
      case "copy":
        try {
          await navigator.clipboard.writeText(`${shareText} ${siteUrl}`)
          alert("✅ Link copied to clipboard!")
          return
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement("textarea")
          textArea.value = `${shareText} ${siteUrl}`
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand("copy")
          document.body.removeChild(textArea)
          alert("✅ Link copied to clipboard!")
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share this Tool
        </CardTitle>
        <div className="text-sm text-gray-600">Help others discover this inflation calculator</div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button
            variant="outline"
            onClick={() => handleShare("twitter")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
          >
            <span className="text-lg">𝕏</span>
            <span className="hidden sm:inline">Twitter/X</span>
            <span className="sm:hidden">X</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleShare("facebook")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
          >
            <span className="text-lg">📘</span>
            <span className="hidden sm:inline">Facebook</span>
            <span className="sm:hidden">FB</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleShare("linkedin")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
          >
            <span className="text-lg">💼</span>
            <span className="hidden sm:inline">LinkedIn</span>
            <span className="sm:hidden">LI</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleShare("reddit")}
            className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Reddit</span>
            <span className="sm:hidden">Reddit</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleShare("copy")}
            className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300"
          >
            <span className="text-lg">📋</span>
            <span className="hidden sm:inline">Copy Link</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            💡 Share with friends, colleagues, or anyone interested in understanding how inflation affects their money
            over time!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialShare
