"use client"

import { useEffect } from "react"

interface ExternalScriptsProps {
  gaTrackingId?: string
}

export function ExternalScripts({ gaTrackingId }: ExternalScriptsProps) {
  useEffect(() => {
    // Google AdSense
    const adScript = document.createElement("script")
    adScript.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9295410934525516"
    adScript.async = true
    adScript.crossOrigin = "anonymous"
    document.head.appendChild(adScript)

    // Google Analytics
    if (gaTrackingId) {
      const gaScript = document.createElement("script")
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`
      gaScript.async = true
      document.head.appendChild(gaScript)

      const gaInline = document.createElement("script")
      gaInline.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaTrackingId}');
      `
      document.head.appendChild(gaInline)
    }
  }, [gaTrackingId])

  return null
}
