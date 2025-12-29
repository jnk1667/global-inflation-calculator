import type { Metadata } from "next"
import Link from "next/link"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Privacy Policy | Global Inflation Calculator",
  description:
    "Read our privacy policy on data collection, usage, and protection. Learn how we secure your personal information online.",
  keywords: [
    "privacy policy",
    "data protection",
    "personal information",
    "cookies policy",
    "user privacy",
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
    title: "Privacy Policy | Global Inflation Calculator",
    description: "Read our privacy policy on data collection, usage, and protection.",
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
    title: "Privacy Policy | Global Inflation Calculator",
    description: "Read our privacy policy on data collection, usage, and protection.",
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

              <div className="bg-slate-900 rounded-lg p-8 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* About Privacy Section */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Privacy Policy</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      Learn how we protect your data and respect your privacy on Global Inflation Calculator.
                    </p>
                  </div>

                  {/* Data Protection Standards */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Data Protection Standards</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="text-slate-300">• GDPR Compliance</li>
                      <li className="text-slate-300">• CCPA Compliance</li>
                      <li className="text-slate-300">• SOC 2 Type II Standards</li>
                      <li className="text-slate-300">• ISO 27001 Security</li>
                      <li className="text-slate-300">• Cookie Consent Management</li>
                    </ul>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                          Home - Inflation Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/deflation-calculator"
                          className="text-slate-300 hover:text-white transition-colors"
                        >
                          Deflation Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/charts" className="text-slate-300 hover:text-white transition-colors">
                          Charts & Analytics
                        </Link>
                      </li>
                      <li>
                        <Link href="/ppp-calculator" className="text-slate-300 hover:text-white transition-colors">
                          PPP Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/salary-calculator" className="text-slate-300 hover:text-white transition-colors">
                          Salary Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/retirement-calculator"
                          className="text-slate-300 hover:text-white transition-colors"
                        >
                          Retirement Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/student-loan-calculator"
                          className="text-slate-300 hover:text-white transition-colors"
                        >
                          Student Loan Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/mortgage-calculator" className="text-slate-300 hover:text-white transition-colors">
                          Mortgage Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/budget-calculator" className="text-slate-300 hover:text-white transition-colors">
                          Budget Calculator
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/emergency-fund-calculator"
                          className="text-slate-300 hover:text-white transition-colors"
                        >
                          Emergency Fund Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/roi-calculator" className="text-slate-300 hover:text-white transition-colors">
                          ROI Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/legacy-planner" className="text-slate-300 hover:text-white transition-colors">
                          Legacy Planner
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    &copy; 2025 Global Inflation Calculator. Educational purposes only.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  )
}
