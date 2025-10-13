import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Accessibility Statement - Global Inflation Calculator",
  description:
    "Learn about our commitment to web accessibility and the features we've implemented to make our inflation calculator accessible to all users.",
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/accessibility",
  },
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Accessibility Statement</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our commitment to making the Global Inflation Calculator accessible to everyone
          </p>
        </header>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Our Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Global Inflation Calculator is committed to ensuring digital accessibility for people with disabilities.
              We are continually improving the user experience for everyone and applying the relevant accessibility
              standards.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
          </CardHeader>
          <CardContent>
            <section aria-label="Implemented accessibility features">
              <h3 className="font-semibold mb-3">We have implemented the following features:</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Semantic HTML5 markup for proper document structure</li>
                <li>ARIA labels and roles for screen reader compatibility</li>
                <li>Keyboard navigation support for all interactive elements</li>
                <li>High contrast color schemes for better visibility</li>
                <li>Responsive design that works on all device sizes</li>
                <li>Alternative text for all images and icons</li>
                <li>Clear focus indicators for keyboard navigation</li>
                <li>Consistent navigation structure across all pages</li>
                <li>Form labels and error messages for screen readers</li>
                <li>Skip navigation links for quick access to main content</li>
              </ul>
            </section>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Standards Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These
              guidelines explain how to make web content more accessible for people with disabilities.
            </p>
            <p>
              Our website has been designed with accessibility in mind, including support for screen readers, keyboard
              navigation, and other assistive technologies.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Site Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <nav aria-label="Site structure">
              <h3 className="font-semibold mb-3">Main Pages:</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-blue-600 hover:underline">
                    Home - Inflation Calculator
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Calculate historical inflation across 8 major currencies from 1913-2025
                  </p>
                </li>
                <li>
                  <Link href="/deflation-calculator" className="text-blue-600 hover:underline">
                    Deflation Calculator
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Compare purchasing power growth of Bitcoin, Ethereum, Gold, Silver, and Oil
                  </p>
                </li>
                <li>
                  <Link href="/charts" className="text-blue-600 hover:underline">
                    Charts & Analytics
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Interactive charts showing inflation trends, currency comparisons, and economic data
                  </p>
                </li>
                <li>
                  <Link href="/salary-calculator" className="text-blue-600 hover:underline">
                    Salary Calculator
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Calculate what historical salaries should be worth today
                  </p>
                </li>
                <li>
                  <Link href="/retirement-calculator" className="text-blue-600 hover:underline">
                    Retirement Calculator
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Plan for retirement considering inflation's impact on savings
                  </p>
                </li>
                <li>
                  <Link href="/legacy-planner" className="text-blue-600 hover:underline">
                    Legacy Planner
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Project wealth transfer across multiple generations
                  </p>
                </li>
                <li>
                  <Link href="/about" className="text-blue-600 hover:underline">
                    About Us
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">Learn about our mission and team</p>
                </li>
                <li>
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">How we handle your data and privacy</p>
                </li>
                <li>
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    Terms and conditions for using our service
                  </p>
                </li>
              </ul>
            </nav>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We welcome your feedback on the accessibility of Global Inflation Calculator. Please let us know if you
              encounter accessibility barriers:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:admin@globalinflationcalculator.com" className="text-blue-600 hover:underline">
                  admin@globalinflationcalculator.com
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              We try to respond to accessibility feedback within 5 business days.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Accessibility of Global Inflation Calculator relies on the following technologies to work with the
              particular combination of web browser and any assistive technologies or plugins installed on your
              computer:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>HTML5</li>
              <li>WAI-ARIA</li>
              <li>CSS3</li>
              <li>JavaScript (with graceful degradation)</li>
            </ul>
            <p className="mt-4">
              These technologies are relied upon for conformance with the accessibility standards used.
            </p>
          </CardContent>
        </Card>

        <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Last updated: October 2025</p>
        </footer>
      </main>
    </div>
  )
}
