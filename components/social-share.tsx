"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Share2, Twitter, Facebook, Linkedin, Link, Mail } from "lucide-react"

interface SocialShareProps {
  url?: string
  title?: string
  description?: string
  hashtags?: string[]
}

export default function SocialShare({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Global Inflation Calculator",
  description = "Calculate and compare inflation rates across different currencies and time periods",
  hashtags = ["inflation", "calculator", "economics", "finance"],
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  // Safe URL handling
  const safeUrl = typeof url === "string" && url.length > 0 ? url : "https://example.com"
  const safeTitle = typeof title === "string" ? title : "Global Inflation Calculator"
  const safeDescription = typeof description === "string" ? description : "Calculate inflation rates"
  const safeHashtags = Array.isArray(hashtags) ? hashtags : ["inflation", "calculator"]

  const encodedUrl = encodeURIComponent(safeUrl)
  const encodedTitle = encodeURIComponent(safeTitle)
  const encodedDescription = encodeURIComponent(safeDescription)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${safeHashtags.join(",")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  }

  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(safeUrl)
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
        })
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = safeUrl
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          setCopied(true)
          toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard.",
          })
        } catch (err) {
          console.error("Failed to copy link:", err)
          toast({
            title: "Copy failed",
            description: "Unable to copy link. Please copy manually.",
            variant: "destructive",
          })
        } finally {
          document.body.removeChild(textArea)
        }
      }

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Failed to copy link:", err)
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please copy manually.",
        variant: "destructive",
      })
    }
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    try {
      const link = shareLinks[platform]
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer,width=600,height=400")
      }
    } catch (err) {
      console.error(`Failed to share on ${platform}:`, err)
      toast({
        title: "Share failed",
        description: `Unable to open ${platform} share dialog.`,
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: safeTitle,
          text: safeDescription,
          url: safeUrl,
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Native share failed:", err)
          toast({
            title: "Share failed",
            description: "Unable to share using native dialog.",
            variant: "destructive",
          })
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
          <Share2 className="h-5 w-5" />
          Share this Tool
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Help others discover this inflation calculator</p>
      </div>

      {/* Native Share (if supported) */}
      {typeof navigator !== "undefined" && navigator.share && (
        <Button onClick={handleNativeShare} className="w-full mb-4" variant="default">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}

      {/* Social Media Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => handleShare("twitter")} variant="outline" size="sm" className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Twitter/X
        </Button>

        <Button onClick={() => handleShare("facebook")} variant="outline" size="sm" className="flex items-center gap-2">
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>

        <Button onClick={() => handleShare("linkedin")} variant="outline" size="sm" className="flex items-center gap-2">
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </Button>

        <Button onClick={() => handleShare("email")} variant="outline" size="sm" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>

        <Button onClick={handleCopyLink} variant="outline" size="sm">
          <Link className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        💡 Share with friends, colleagues, or anyone interested in understanding how inflation affects their money over
        time!
      </div>
    </div>
  )
}
