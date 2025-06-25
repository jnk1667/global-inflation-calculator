"use client"

import InflationCalculator from "@/components/inflation-calculator"
import FAQ from "@/components/faq"
import { ErrorBoundary } from "@/components/error-boundary"

export default function HomePage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">🌍 Global Inflation Calculator</h1>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">✅ New Version Deployed!</h2>
            <p className="text-gray-600">If you see this message, the deployment is working.</p>
            <p className="text-sm text-gray-500 mt-4">Next step: Load the full calculator component</p>
          </div>

          {/* Main Calculator */}
          <InflationCalculator />

          {/* FAQ Section */}
          <div className="mt-16">
            <FAQ />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Global Inflation Calculator</h3>
                <p className="text-gray-300">
                  Track inflation across major world currencies with historical data from 1913 to 2025.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• US Bureau of Labor Statistics</li>
                  <li>• UK Office for National Statistics</li>
                  <li>• Eurostat</li>
                  <li>• Statistics Canada</li>
                  <li>• Australian Bureau of Statistics</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Last Updated</h4>
                <p className="text-gray-300">June 2025</p>
                <p className="text-sm text-gray-400 mt-2">Data is updated monthly from official government sources.</p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Global Inflation Calculator. Educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
