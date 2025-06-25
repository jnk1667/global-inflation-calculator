"use client"

import { Button } from "@/components/ui/button"

export default function SocialShare() {
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = "Check out this amazing inflation calculator! See what your money was worth decades ago 💰"

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      alert("Link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">📢 Share This Tool</h3>
      <p className="text-gray-600 text-center mb-6">Help others discover the purchasing power of money through time</p>

      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={shareToTwitter} className="bg-black hover:bg-gray-800 text-white">
          𝕏 Twitter/X
        </Button>

        <Button onClick={shareToFacebook} className="bg-blue-600 hover:bg-blue-700 text-white">
          📘 Facebook
        </Button>

        <Button onClick={shareToLinkedIn} className="bg-blue-700 hover:bg-blue-800 text-white">
          💼 LinkedIn
        </Button>

        <Button onClick={copyToClipboard} variant="outline" className="border-gray-300 hover:bg-gray-50">
          🌐 Copy Link
        </Button>
      </div>
    </div>
  )
}
