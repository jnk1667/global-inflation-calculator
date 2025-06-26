import Script from "next/script"

const AdUnits = () => {
  return (
    <>
      {/* Google AdSense */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />

      {/* Example Ad Unit 1 */}
      <Script id="ad-unit-1" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-xxxxxxxxxxxxxxxx",
            enable_page_level_ads: true
          });
        `}
      </Script>

      {/* Example Ad Unit 2 - In-page ad */}
      <Script id="ad-unit-2" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-xxxxxxxxxxxxxxxx",
            ad_slot: "yyyyyyyyyy",
            ad_format: "auto",
            ad_type: "textimage",
            fullWidthResponsive: true
          });
        `}
      </Script>

      {/* Example Ad Unit 3 - In-article ad */}
      <Script id="ad-unit-3" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-xxxxxxxxxxxxxxxx",
            ad_slot: "zzzzzzzzzz",
            ad_format: "fluid",
            ad_layout: "in-article",
            ad_style: {height: 300}
          });
        `}
      </Script>
    </>
  )
}

export default AdUnits
