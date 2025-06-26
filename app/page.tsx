import Script from "next/script"

export default function Home() {
  return (
    <main>
      <h1>Welcome to My Next.js App</h1>
      <p>This is a simple example page.</p>

      {/* Example Script usage - Remove priority if present and keep strategy */}
      <Script src="https://example.com/script1.js" strategy="afterInteractive" />

      {/* Another example Script usage - Remove priority if present and keep strategy */}
      <Script src="https://example.com/script2.js" strategy="afterInteractive" />

      {/* Yet another example Script usage - Remove priority if present and keep strategy */}
      <Script src="https://example.com/script3.js" strategy="afterInteractive" />
    </main>
  )
}
