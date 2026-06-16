import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import Link from "next/link"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Terms of Service | Global Inflation Calculator",
  description:
    "Read the Terms of Service for Global Inflation Calculator — covering usage rights, data accuracy disclaimers, AI access policy, third-party data sources, and legal guidelines for all 20+ free financial calculators.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "usage agreement",
    "legal terms",
    "service agreement",
    "inflation calculator terms",
    "financial calculator terms of use",
    "user agreement",
    "data accuracy disclaimer",
    "AI access policy",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service | Global Inflation Calculator",
    description:
      "Read the Terms of Service for Global Inflation Calculator — covering usage rights, data accuracy disclaimers, AI access policy, third-party data sources, and legal guidelines for all 20+ free financial calculators.",
    url: `${siteUrl}/terms`,
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "/og-image.png",
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
    title: "Terms of Service | Global Inflation Calculator",
    description:
      "Read the Terms of Service for Global Inflation Calculator — covering usage rights, data accuracy disclaimers, AI access policy, third-party data sources, and legal guidelines for all 20+ free financial calculators.",
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
        name: "Terms of Service",
        item: "https://www.globalinflationcalculator.com/terms",
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-lg">
                <strong>Last updated:</strong> May 5, 2026
              </p>
              <p>
                Please read these Terms of Service carefully before using Global Inflation Calculator. These terms apply
                to all visitors, users, and anyone who accesses or uses our platform.
              </p>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using the Global Inflation Calculator website and services at{" "}
                  <strong>globalinflationcalculator.com</strong>, you accept and agree to be bound by these Terms of
                  Service and all applicable laws and regulations. If you do not agree with any of these terms, you are
                  prohibited from using or accessing this site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                <p>
                  Global Inflation Calculator is a free online financial education platform offering more than 20
                  inflation-related calculators and analytical tools across 8 major global currencies (USD, GBP, EUR,
                  CAD, AUD, CHF, JPY, and NZD). Our platform covers data from 1913 to the present using official
                  government and institutional sources. Current tools and features include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Inflation Calculator — historical CPI-based purchasing power calculations</li>
                  <li>Salary &amp; Wage Inflation Calculator — real wage comparisons over time</li>
                  <li>Retirement Calculator — inflation-adjusted retirement projections</li>
                  <li>Purchasing Power Parity (PPP) Calculator — cross-country cost comparisons across 200+ countries</li>
                  <li>Shrinkflation Calculator — hidden inflation from package size reductions</li>
                  <li>Skimpflation Calculator — hidden inflation from quality reductions</li>
                  <li>Sneakflation Calculator — hidden inflation from fee additions and benefit removals</li>
                  <li>Deflation Calculator — purchasing power analysis of deflationary assets</li>
                  <li>Energy Inflation Calculator — electricity, gas, and fuel cost projections</li>
                  <li>Investment Race Calculator — real inflation-adjusted multi-asset return comparisons</li>
                  <li>Compound Interest Calculator — inflation-adjusted compounding analysis</li>
                  <li>ROI Calculator — real return on investment with inflation adjustment</li>
                  <li>Mortgage Calculator — affordability analysis using Case-Shiller and income data</li>
                  <li>Home Affordability Calculator — inflation-adjusted maximum purchase price</li>
                  <li>Budget Calculator — 50/30/20 rule with inflation-adjusted planning</li>
                  <li>Emergency Fund Calculator — recession-ready savings planning</li>
                  <li>Insurance Inflation Calculator — healthcare premium cost projections</li>
                  <li>Auto Loan Calculator — car price inflation and financing analysis</li>
                  <li>Student Loan Calculator — repayment planning with real salary benchmarks</li>
                  <li>Legacy Planner — multi-generational wealth transfer and inheritance planning</li>
                  <li>Global Net Worth Calculator — inflation-adjusted asset and liability tracking</li>
                  <li>Inflation Charts &amp; Analytics — interactive visualizations across all currencies</li>
                  <li>Regional Cost of Living Calculator — salary comparisons by location and occupation</li>
                </ul>
                <p className="mt-3">
                  All tools are provided free of charge for personal, educational, and research purposes. No account or
                  registration is required.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Third-Party Data Sources</h2>
                <p>
                  Our calculators and analytical tools draw from a range of official government and institutional data
                  sources, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>U.S. Bureau of Labor Statistics (BLS) — Consumer Price Index (CPI) data</li>
                  <li>U.S. Federal Reserve (FRED) — interest rates, housing data, and economic indicators</li>
                  <li>U.S. Energy Information Administration (EIA) — energy price data</li>
                  <li>U.S. Department of Education College Scorecard — graduate earnings by major</li>
                  <li>S&amp;P/Case-Shiller Home Price Index — residential real estate price history</li>
                  <li>World Bank and OECD — purchasing power parity data across 200+ countries</li>
                  <li>Official national statistics agencies for the UK (ONS), Eurozone (Eurostat), Canada (Statistics Canada), Australia (ABS), Switzerland (FSO), Japan (Statistics Bureau), and New Zealand (Stats NZ)</li>
                </ul>
                <p className="mt-3">
                  While we make every effort to ensure our data is accurate and up to date, Global Inflation Calculator
                  is not responsible for errors, omissions, or changes in data published by these third-party sources.
                  All data is used for informational and educational purposes only.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Use License</h2>
                <p>
                  Permission is granted to access and use our website for personal, non-commercial, and educational
                  purposes only. This is the grant of a license, not a transfer of title. Under this license you may
                  not:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Modify, copy, or reproduce our materials for redistribution</li>
                  <li>Use our calculators, content, or data for commercial purposes or public commercial display without prior written consent</li>
                  <li>Attempt to reverse engineer, decompile, or disassemble any software or algorithms on our platform</li>
                  <li>Remove or alter any copyright, trademark, or proprietary notices from our materials</li>
                  <li>Mirror or republish our tools or content on another website or application</li>
                </ul>
                <p className="mt-3">
                  This license will automatically terminate if you violate any of these restrictions. Upon termination,
                  you must destroy any downloaded or cached materials in your possession.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Accuracy and Financial Disclaimer</h2>
                <p>
                  All results produced by our calculators are for <strong>informational and educational purposes
                  only</strong> and do not constitute financial, investment, tax, legal, or professional advice. While
                  we use official government and institutional data sources, we make no warranties — express or implied
                  — regarding the completeness, accuracy, reliability, or suitability of any calculation or result.
                </p>
                <p className="mt-3">
                  Inflation data, interest rates, asset prices, and economic conditions change continuously. Past
                  inflation trends are not indicative of future results. Any financial decisions you make based on
                  information from this platform are solely your responsibility. We strongly recommend consulting a
                  qualified financial professional before making significant financial decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. AI and Automated Access Policy</h2>
                <p>
                  Global Inflation Calculator publishes a machine-readable site guide at{" "}
                  <Link href="/llms.txt" className="text-primary hover:underline">
                    globalinflationcalculator.com/llms.txt
                  </Link>{" "}
                  intended for AI assistants, language models, and automated research tools. You may access and
                  reference this document for the purpose of understanding our platform. However:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Automated scraping or bulk downloading of our calculator outputs, data, or content for the purpose of training AI or machine learning models is prohibited without prior written consent</li>
                  <li>AI-generated summaries or reproductions of our content must attribute Global Inflation Calculator as the source</li>
                  <li>We reserve the right to block or rate-limit automated access that places undue load on our servers</li>
                  <li>Use of our content by AI systems for commercial derivative works is not permitted without a separate licensing agreement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Prohibited Uses</h2>
                <p>You may not use our service for any of the following:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>Violating any international, federal, provincial, state, or local laws or regulations</li>
                  <li>Infringing upon our intellectual property rights or those of any third party</li>
                  <li>Harassing, abusing, defaming, or discriminating against any individual or group</li>
                  <li>Submitting false, misleading, or deceptive information through any contact or feedback form</li>
                  <li>Introducing viruses, malware, or any other malicious or disruptive code</li>
                  <li>Attempting to gain unauthorized access to any part of our platform or its underlying infrastructure</li>
                  <li>Collecting user data from our platform in violation of applicable privacy laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by applicable law, Global Inflation Calculator and its operators,
                  contributors, and affiliates shall not be liable for any direct, indirect, incidental, special,
                  consequential, or punitive damages — including but not limited to loss of profits, data, goodwill, or
                  other intangible losses — arising out of or in connection with your use of, or inability to use, our
                  platform or any content, tools, or results obtained from it.
                </p>
                <p className="mt-3">
                  This limitation applies regardless of whether the damages arise from contract, tort (including
                  negligence), strict liability, or any other legal theory, even if we have been advised of the
                  possibility of such damages.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Privacy Policy</h2>
                <p>
                  Your privacy is important to us. Our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  governs how we collect, use, and protect any information in connection with your use of this platform.
                  By using our service, you also agree to the terms set out in our Privacy Policy, which is incorporated
                  by reference into these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modifications to Terms</h2>
                <p>
                  We reserve the right to revise these Terms of Service at any time. When we make changes, we will
                  update the "Last updated" date at the top of this page. Your continued use of the platform after any
                  changes constitutes your acceptance of the revised terms. We encourage you to review this page
                  periodically to stay informed of any updates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Governing Law</h2>
                <p>
                  These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction
                  in which Global Inflation Calculator is registered. You irrevocably submit to the exclusive
                  jurisdiction of the courts in that jurisdiction for the resolution of any disputes arising out of or
                  in connection with these terms or your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Information</h2>
                <p>
                  If you have any questions, concerns, or requests regarding these Terms of Service, please contact us
                  at:{" "}
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

              <div className="bg-slate-900 rounded-lg p-8 -mx-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Column 1: Terms of Service Info */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Terms of Service</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      Review our terms governing the use of Global Inflation Calculator's services, including usage
                      rights, disclaimers, and legal obligations.
                    </p>
                  </div>

                  {/* Column 2: Legal Compliance */}
                  <div>
                    <h4 className="font-semibold text-white mb-4">Legal Compliance</h4>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Fair Use Policy</li>
                      <li>• Intellectual Property Rights</li>
                      <li>• Service Modifications</li>
                      <li>• Limitation of Liability</li>
                      <li>• Dispute Resolution</li>
                    </ul>
                  </div>

                  {/* Column 3: Quick Links */}
                  <div>
                    <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                      {[
                        { href: "/",                                                   label: "Home - Inflation Calculator"       },
                        { href: "/mortgage-calculator",                                label: "Mortgage Calculator"               },
                        { href: "/home-affordability-calculator/inflation-adjusted",   label: "Home Affordability Calculator"     },
                        { href: "/deflation-calculator",                               label: "Deflation Calculator"              },
                        { href: "/shrinkflation-calculator",                           label: "Shrinkflation Calculator"          },
                        { href: "/energy-inflation-calculator",                        label: "Energy Inflation Calculator"       },
                        { href: "/skimpflation-calculator",                            label: "Skimpflation Calculator"           },
                        { href: "/sneakflation-calculator",                            label: "Sneakflation Calculator"           },
                        { href: "/subscription-inflation-calculator",                  label: "Subscription Inflation Calculator" },
                        { href: "/charts",                                             label: "Charts & Analytics"                },
                        { href: "/investment-race-calculator",                         label: "Investment Race Calculator"        },
                        { href: "/global-compound-interest",                           label: "Compound Interest Calculator"      },
                        { href: "/global-net-worth-calculator",                        label: "Global Net Worth Calculator"       },
                        { href: "/ppp-calculator",                                     label: "PPP Calculator"                    },
                        { href: "/auto-loan-calculator",                               label: "Auto Loan Calculator"              },
                        { href: "/salary-calculator",                                  label: "Salary Calculator"                 },
                        { href: "/retirement-calculator",                              label: "Retirement Calculator"             },
                        { href: "/student-loan-calculator",                            label: "Student Loan Calculator"           },
                        { href: "/budget-calculator",                                  label: "Budget Calculator"                 },
                        { href: "/emergency-fund-calculator",                          label: "Emergency Fund Calculator"         },
                        { href: "/roi-calculator",                                     label: "ROI Calculator"                    },
                        { href: "/insurance-inflation-calculator",                     label: "Insurance Inflation Calculator"    },
                        { href: "/legacy-planner",                                     label: "Legacy Planner"                    },
                        { href: "/education-inflation-calculator",                     label: "Education Inflation Calculator"    },
                        { href: "/salary-calculator/regional-cost-of-living",          label: "Regional Cost of Living"           },
                        { href: "/dateflation-calculator",                             label: "Dateflation Calculator"            },
                        { href: "/about",                                              label: "About Us"                          },
                        { href: "/privacy",                                            label: "Privacy Policy"                    },
                        { href: "/terms",                                              label: "Terms of Service"                  },
                      ].map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-slate-300 hover:text-white transition-colors text-sm">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">
                    &copy; 2026 Global Inflation Calculator. Educational purposes only.
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
