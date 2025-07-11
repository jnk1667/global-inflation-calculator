"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Twitter, Facebook, Linkedin } from "lucide-react"

const SocialShare: React.FC = () => {
  const siteUrl = typeof window !== "undefined" ? window.location.href : "https://globalinflationcalculator.com"
  const shareText =
    "Check out this Global Inflation Calculator - calculate how inflation affects your money over time across different currencies from 1913 to present!"

  const shareLinks = [
    {
      name: "Twitter/X",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`,
      color: "text-black hover:text-gray-700",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`,
      color: "text-blue-600 hover:text-blue-700",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`,
      color: "text-blue-700 hover:text-blue-800",
    },
    {
      name: "Reddit",
      icon: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.248.561 1.248 1.249a1.25 1.25 0 0 1-2.498 0 1.25 1.25 0 0 1 1.25-1.249zm1.911 8.208c-.122.479-.298.94-.526 1.374a6.594 6.594 0 0 1-.808 1.239 6.7 6.7 0 0 1-1.084 1.018 6.613 6.613 0 0 1-1.315.731c-.503.2-1.02.322-1.548.322-.025 0-.05 0-.075-.004a6.96 6.96 0 0 1-1.548-.318 6.613 6.613 0 0 1-1.315-.731 6.7 6.7 0 0 1-1.084-1.018 6.594 6.594 0 0 1-.808-1.239 5.814 5.814 0 0 1-.526-1.374 6.04 6.04 0 0 1-.170-1.428c0-.14.003-.281.009-.421.017-.378.048-.756.092-1.131.088-.751.25-1.487.483-2.202.233-.714.537-1.407.906-2.068.369-.66.8-1.29 1.289-1.87a9.777 9.777 0 0 1 1.659-1.654c.6-.5 1.252-.924 1.948-1.269.348-.173.708-.329 1.076-.467.184-.069.372-.133.562-.191.095-.029.19-.057.287-.082.048-.013.097-.024.145-.035.024-.005.049-.01.073-.014a.918.918 0 0 1 .125-.018.867.867 0 0 1 .121-.007c.043 0 .086.002.129.007a.918.918 0 0 1 .125.018c.024.004.049.009.073.014.048.011.097.022.145.035.097.025.192.053.287.082.19.058.378.122.562.191.368.138.728.294 1.076.467.696.345 1.348.769 1.948 1.269a9.777 9.777 0 0 1 1.659 1.654c.489.58.92 1.21 1.289 1.87.369.661.673 1.354.906 2.068.233.715.395 1.451.483 2.202.044.375.075.753.092 1.131.006.14.009.281.009.421a6.04 6.04 0 0 1-.170 1.428z" />
        </svg>
      ),
      url: `https://reddit.com/submit?url=${encodeURIComponent(siteUrl)}&title=${encodeURIComponent(shareText)}`,
      color: "text-orange-600 hover:text-orange-700",
    },
  ]

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Global Inflation Calculator",
          text: shareText,
          url: siteUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${siteUrl}`)
        alert("Link copied to clipboard!")
      } catch (error) {
        console.log("Error copying to clipboard:", error)
      }
    }
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share This Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Help others understand inflation's impact on their money. Share this calculator with friends and family!
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleShare} className="flex items-center gap-2 bg-transparent" variant="outline">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          {shareLinks.map((link) => (
            <Button
              key={link.name}
              onClick={() => window.open(link.url, "_blank", "width=550,height=420")}
              variant="outline"
              className={`flex items-center gap-2 ${link.color}`}
            >
              {typeof link.icon === "function" ? <link.icon /> : <link.icon className="w-4 h-4" />}
              {link.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialShare
