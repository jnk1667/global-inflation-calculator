import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Accessibility Statement | Global Inflation Calculator",
  description:
    "Our commitment to web accessibility. Learn about WCAG 2.1 Level AA compliance, screen reader support, and assistive technology features.",
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/accessibility",
  },
  keywords: [
    "accessibility statement",
    "WCAG compliance",
    "screen reader compatible",
    "keyboard navigation",
    "inflation calculator accessibility",
    "financial tools accessibility",
    "ARIA implementation",
    "web accessibility",
  ],
  openGraph: {
    title: "Accessibility Statement | Global Inflation Calculator",
    description:
      "Comprehensive accessibility documentation for our inflation calculators, including WCAG 2.1 Level AA compliance and assistive technology support.",
    url: "https://www.globalinflationcalculator.com/accessibility",
    type: "website",
  },
}

export default function AccessibilityPage() {
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
        name: "Accessibility",
        item: "https://www.globalinflationcalculator.com/accessibility",
      },
    ],
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Accessibility Statement",
    description:
      "Comprehensive accessibility documentation for Global Inflation Calculator, including WCAG 2.1 Level AA compliance, ARIA implementations, and assistive technology support.",
    url: "https://www.globalinflationcalculator.com/accessibility",
    about: {
      "@type": "Thing",
      name: "Web Accessibility",
      description:
        "Documentation of accessibility features, WCAG compliance, and assistive technology support for financial calculators and tools.",
    },
    mainEntity: {
      "@type": "WebSite",
      name: "Global Inflation Calculator",
      url: "https://www.globalinflationcalculator.com",
      accessibilityFeature: [
        "alternativeText",
        "highContrast",
        "keyboardNavigation",
        "readingOrder",
        "structuralNavigation",
        "tableOfContents",
        "ARIA",
        "largePrint",
        "displayTransformability",
      ],
      accessibilityControl: ["fullKeyboardControl", "fullMouseControl", "fullTouchControl"],
      accessibilityHazard: ["noFlashingHazard", "noMotionSimulationHazard", "noSoundHazard"],
      accessMode: ["textual", "visual"],
      accessModeSufficient: ["textual", "visual"],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
              <CardTitle>ARIA Implementation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Landmark Roles</h3>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="navigation"</code> - Main
                    navigation menus and footer navigation
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="main"</code> - Primary content
                    area on each page
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="contentinfo"</code> - Footer
                    sections with site information
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="region"</code> - Important
                    sections like charts and calculators
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interactive Elements</h3>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">aria-label</code> - Descriptive labels
                    for buttons, inputs, and interactive controls
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">aria-describedby</code> - Additional
                    context for form fields and error messages
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="radiogroup"</code> - Currency
                    selection controls
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="alert"</code> - Error messages and
                    important notifications
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role="status"</code> - Loading
                    indicators and progress updates
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Keyboard Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>All interactive elements can be accessed and operated using keyboard only:</p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">Standard Navigation</h3>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Tab</kbd> - Move forward
                      through interactive elements
                    </li>
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Shift + Tab</kbd> - Move
                      backward through interactive elements
                    </li>
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Enter</kbd> or{" "}
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Space</kbd> - Activate
                      buttons and links
                    </li>
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Esc</kbd> - Close modals
                      and dialogs
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Form Controls</h3>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Arrow Keys</kbd> -
                      Navigate through radio buttons and select options
                    </li>
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Arrow Keys</kbd> - Adjust
                      slider values (year selection, amount input)
                    </li>
                    <li>
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Home</kbd> /{" "}
                      <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">End</kbd> - Jump to
                      minimum/maximum slider values
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Screen Reader Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Our website has been tested with the following screen readers:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>JAWS</strong> (Job Access With Speech) - Windows
                </li>
                <li>
                  <strong>NVDA</strong> (NonVisual Desktop Access) - Windows
                </li>
                <li>
                  <strong>VoiceOver</strong> - macOS and iOS
                </li>
                <li>
                  <strong>TalkBack</strong> - Android
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                All calculator results, chart data, and form validation messages are announced to screen readers with
                appropriate context and timing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Color Contrast & Visual Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">WCAG AA Compliance</h3>
                <p className="text-sm mb-3">
                  All text and interactive elements meet WCAG 2.1 Level AA contrast requirements:
                </p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>Normal text: Minimum contrast ratio of 4.5:1</li>
                  <li>Large text (18pt+): Minimum contrast ratio of 3:1</li>
                  <li>Interactive elements: Minimum contrast ratio of 3:1</li>
                  <li>Focus indicators: Clearly visible with 3:1 contrast ratio</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dark Mode Support</h3>
                <p className="text-sm">
                  Our website includes a dark mode theme that maintains proper contrast ratios and reduces eye strain in
                  low-light environments. The theme automatically adapts to your system preferences or can be manually
                  toggled.
                </p>
              </div>
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
                    <Link href="/salary-calculator/regional-cost-of-living" className="text-blue-600 hover:underline">
                      Regional Cost of Living Comparison
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Compare cost of living across 80+ cities worldwide with housing, utilities, food, and
                      transportation costs from official government sources
                    </p>
                  </li>
                  <li>
                    <Link href="/auto-loan-calculator" className="text-blue-600 hover:underline">
                      Auto Loan Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Calculate auto loan payments with inflation and gas price analysis
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
                    <Link href="/student-loan-calculator" className="text-blue-600 hover:underline">
                      Student Loan Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Understand how inflation affects student loan debt and repayment strategies
                    </p>
                  </li>
                  <li>
                    <Link href="/emergency-fund-calculator" className="text-blue-600 hover:underline">
                      Emergency Fund Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Calculate emergency savings needs with inflation adjustment for economic uncertainty
                    </p>
                  </li>
                  <li>
                    <Link href="/mortgage-calculator" className="text-blue-600 hover:underline">
                      Mortgage Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Calculate mortgage affordability and compare home prices to household income over time
                    </p>
                  </li>
                  <li>
                    <Link href="/budget-calculator" className="text-blue-600 hover:underline">
                      50/30/20 Budget Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Split your income using the proven 50/30/20 budgeting rule for needs, wants, and savings
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
                    <Link href="/ppp-calculator" className="text-blue-600 hover:underline">
                      PPP Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Compare purchasing power parity across major economies with historical trends
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
                  <li>
                    <Link href="/roi-calculator" className="text-blue-600 hover:underline">
                      ROI Calculator
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Calculate return on investment with inflation adjustment across 8 currencies. Compare your ROI
                      against Treasury rates and discover your real purchasing power gains with advanced mode for
                      institutional-level analysis
                    </p>
                  </li>
                </ul>
              </nav>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Page-Specific Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Inflation Calculator (Home)</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Currency selection with radio buttons and clear labels</li>
                  <li>Year range sliders with keyboard control and value announcements</li>
                  <li>Amount input with proper labeling and validation messages</li>
                  <li>Results announced to screen readers with context</li>
                  <li>Multi-currency comparison chart with data table alternative</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Charts & Analytics</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Interactive charts with keyboard navigation</li>
                  <li>Data tables provided as alternatives to visual charts</li>
                  <li>Chart descriptions explaining what each visualization shows</li>
                  <li>Screenshot functionality with accessible controls</li>
                  <li>Date range filters with clear labels and instructions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Calculators (Salary, Retirement, Legacy)</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Form fields with descriptive labels and help text</li>
                  <li>Real-time validation with error messages</li>
                  <li>Results presented in accessible format with context</li>
                  <li>Progressive disclosure for advanced options</li>
                  <li>Clear instructions for each calculation step</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Auto Loan Calculator</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Vehicle price and loan amount inputs with clear labels</li>
                  <li>Interest rate and term selection with keyboard navigation</li>
                  <li>Down payment calculator with percentage slider and keyboard control</li>
                  <li>Monthly payment results announced to screen readers</li>
                  <li>Total cost breakdown with accessible table structure</li>
                  <li>Gas price and fuel cost projections with descriptive labels</li>
                  <li>Educational content about auto financing with proper heading hierarchy</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Student Loan Calculator</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Loan amount and interest rate inputs with clear labels</li>
                  <li>Repayment term selection with keyboard navigation</li>
                  <li>Inflation adjustment controls with descriptive help text</li>
                  <li>Results table with proper headers and screen reader support</li>
                  <li>Educational content with proper heading hierarchy</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Emergency Fund Calculator</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Monthly expense inputs with descriptive labels and help text</li>
                  <li>Target months selector with keyboard control</li>
                  <li>Risk assessment with clear visual indicators and screen reader announcements</li>
                  <li>Savings timeline with accessible progress visualization</li>
                  <li>Inflation-adjusted projections clearly explained for screen readers</li>
                  <li>Recommendations section with proper semantic structure</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Mortgage Calculator</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Mortgage amount and interest rate inputs with clear labels</li>
                  <li>Loan term selection with keyboard navigation</li>
                  <li>Inflation adjustment controls with descriptive help text</li>
                  <li>Results table with proper headers and screen reader support</li>
                  <li>Comparison charts with accessible alternatives</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">50/30/20 Budget Calculator</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Income input with clear labels and help text</li>
                  <li>Expense categorization with keyboard navigation</li>
                  <li>Budget allocation controls with descriptive help text</li>
                  <li>Results table with proper headers and screen reader support</li>
                  <li>Guidance on the budgeting rule with proper heading hierarchy</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legacy Planner</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Form fields with descriptive labels and help text</li>
                  <li>Real-time validation with error messages</li>
                  <li>Results presented in accessible format with context</li>
                  <li>Progressive disclosure for advanced options</li>
                  <li>Clear instructions for each calculation step</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">PPP Calculator</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Currency selection with radio buttons and clear labels</li>
                  <li>Year range sliders with keyboard control and value announcements</li>
                  <li>Amount input with proper labeling and validation messages</li>
                  <li>Results announced to screen readers with context</li>
                  <li>Multi-currency comparison chart with data table alternative</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Regional Cost of Living Comparison</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>City selection with clear labels</li>
                  <li>Cost category sliders with keyboard control and value announcements</li>
                  <li>Comparison results table with proper headers and screen reader support</li>
                  <li>Interactive map with keyboard navigation</li>
                  <li>Downloadable data with accessible CSV format</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>For AI Assistants and Search Engines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Global Inflation Calculator is a comprehensive suite of financial tools designed to help users
                understand the impact of inflation on their finances. Our platform includes:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Core Features</h3>
                  <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <strong>Historical Inflation Calculator:</strong> Calculate purchasing power changes across 8
                      major world currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, NZD) from 1913 to 2025
                    </li>
                    <li>
                      <strong>Deflation Calculator:</strong> Compare deflationary assets including Bitcoin, Ethereum,
                      Gold, Silver, and Oil against fiat currency inflation
                    </li>
                    <li>
                      <strong>Interactive Charts:</strong> Visualize inflation trends, regional comparisons, and
                      economic data with downloadable charts and comprehensive analysis
                    </li>
                    <li>
                      <strong>Salary Calculator:</strong> Adjust historical salaries for inflation to understand
                      equivalent purchasing power in today's dollars
                    </li>
                    <li>
                      <strong>Auto Loan Calculator:</strong> Calculate auto loan payments with inflation-adjusted
                      vehicle costs and gas price projections for complete ownership analysis
                    </li>
                    <li>
                      <strong>Retirement Calculator:</strong> Plan for retirement with inflation-adjusted projections
                      and savings goals
                    </li>
                    <li>
                      <strong>Student Loan Calculator:</strong> Analyze student loan debt in the context of inflation
                      and develop repayment strategies
                    </li>
                    <li>
                      <strong>Emergency Fund Calculator:</strong> Calculate emergency savings needs adjusted for
                      inflation to prepare for economic uncertainty and job loss scenarios
                    </li>
                    <li>
                      <strong>Mortgage Calculator:</strong> Calculate mortgage affordability and compare home prices to
                      household income over time
                    </li>
                    <li>
                      <strong>Legacy Planner:</strong> Project multi-generational wealth transfer with inflation
                      considerations
                    </li>
                    <li>
                      <strong>50/30/20 Budget Calculator:</strong> Split your income using the proven 50/30/20 budgeting
                      rule for needs, wants, and savings
                    </li>
                    <li>
                      <strong>ROI Calculator:</strong> Calculate return on investment with inflation adjustment across 8
                      currencies. Compare your ROI against Treasury rates and discover your real purchasing power gains
                      with advanced mode for institutional-level analysis
                    </li>
                    <li>
                      <strong>PPP Calculator:</strong> Compare purchasing power parity across major economies with
                      historical trends
                    </li>
                    <li>
                      <strong>Regional Cost of Living Comparison:</strong> Compare cost of living across 80+ cities
                      worldwide with housing, utilities, food, and transportation costs from official government sources
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Data Sources</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our calculations use official government data from the Bureau of Labor Statistics (BLS), OECD,
                    International Monetary Fund (IMF), and national statistical offices. All data is regularly updated
                    to ensure accuracy.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Use Cases</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Users can calculate inflation adjustments for salary negotiations, retirement planning, investment
                    returns, student loan repayment, emergency fund needs, mortgage affordability, budget allocation,
                    legacy planning, purchasing power parity across countries, and auto loan vehicle financing
                    decisions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Accessibility Commitment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All tools are fully accessible via keyboard navigation, screen readers (JAWS, NVDA, VoiceOver,
                    TalkBack), and assistive technologies. We maintain WCAG 2.1 Level AA compliance across all pages and
                    features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
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
            <p>Last updated: December 2025</p>
          </footer>
        </main>
      </div>
    </>
  )
}
