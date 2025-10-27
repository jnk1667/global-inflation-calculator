import type { Metadata } from "next"
import Link from "next/link"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Privacy Policy - Global Inflation Calculator",
  description:
    "Read our comprehensive privacy policy to understand how we collect, use, and protect your personal information when using our inflation calculator.",
  keywords: [
    "privacy policy",
    "data protection",
    "personal information",
    "cookies policy",
    "user privacy",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
    "data security",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy - Global Inflation Calculator",
    description: "Read our comprehensive privacy policy to understand how we protect your personal information.",
    url: `${siteUrl}/privacy`,
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "/images/globe-icon.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator Privacy Policy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Global Inflation Calculator",
    description: "Read our comprehensive privacy policy to understand how we protect your personal information.",
    images: ["/images/globe-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function PrivacyPolicy() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Privacy Policy",
        item: "https://www.globalinflationcalculator.com/privacy",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-lg">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you use our inflation calculator,
                  contact us, or interact with our website. This may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Calculation inputs (amounts, dates, currencies)</li>
                  <li>Usage patterns and preferences</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our inflation calculator service</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your
                  consent, except as described in this policy. We may share information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With service providers who assist in operating our website</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our website. You can
                  control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction. However, no method of transmission over the internet
                  is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of certain communications</li>
                  <li>Lodge a complaint with supervisory authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the
                  new policy on this page with an updated effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:{" "}
                  <a href="mailto:admin@globalinflationcalculator.com" className="text-primary hover:underline">
                    admin@globalinflationcalculator.com
                  </a>
                </p>
              </section>
            </div>

            <footer className="mt-8 pt-6 border-t border-border">
              <div className="mb-6">
                <Link href="/" className="inline-flex items-center text-primary hover:underline">
                  ← Back to Calculator
                </Link>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Calculator Tools</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                          Inflation Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/deflation-calculator"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Deflation Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/salary-calculator"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Salary Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/retirement-calculator"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Retirement Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/student-loan-calculator"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Student Loan Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/charts" className="text-muted-foreground hover:text-primary transition-colors">
                          Charts & Analytics
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Information</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                          About Us
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Legal</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Contact</h4>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href="mailto:admin@globalinflationcalculator.com"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Contact Us
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
                  <p>&copy; 2025 Global Inflation Calculator. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  )
}
