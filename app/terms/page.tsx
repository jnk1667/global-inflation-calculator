import type { Metadata } from "next"
import Link from "next/link"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Terms of Service - Global Inflation Calculator",
  description:
    "Read our terms of service to understand the rules and guidelines for using our free inflation calculator and historical economic data.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "usage agreement",
    "legal terms",
    "service agreement",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
    "user agreement",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service - Global Inflation Calculator",
    description: "Read our terms of service to understand the rules and guidelines for using our inflation calculator.",
    url: `${siteUrl}/terms`,
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "/images/globe-icon.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator Terms of Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Global Inflation Calculator",
    description: "Read our terms of service to understand the rules and guidelines for using our inflation calculator.",
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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-lg">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Global Inflation Calculator website and services, you accept and agree to be
                bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p>
                Global Inflation Calculator provides a free online tool for calculating historical inflation rates and
                purchasing power across multiple currencies. Our service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Historical inflation calculations</li>
                <li>Purchasing power comparisons</li>
                <li>Currency conversion tools</li>
                <li>Economic data visualization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Use License</h2>
              <p>
                Permission is granted to temporarily use our website for personal, non-commercial transitory viewing
                only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes or public display</li>
                <li>Attempt to reverse engineer any software contained on our website</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Accuracy Disclaimer</h2>
              <p>
                While we strive to provide accurate historical inflation data sourced from official government
                statistics, we make no warranties about the completeness, reliability, and accuracy of this information.
                Any action you take upon the information on our website is strictly at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Prohibited Uses</h2>
              <p>You may not use our service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules, laws, or local
                  ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual property rights of
                  others
                </li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
              <p>
                In no event shall Global Inflation Calculator or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business interruption) arising out of
                the use or inability to use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Privacy Policy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Modifications</h2>
              <p>
                We may revise these terms of service at any time without notice. By using this website, you are agreeing
                to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction
                in which our company is registered, and you irrevocably submit to the exclusive jurisdiction of the
                courts in that state or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:{" "}
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
  )
}
