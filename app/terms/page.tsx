import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using Global Inflation Calculator ("the Service"), you accept and agree to be bound by
              the terms and provision of this agreement.
            </p>

            <h2>Description of Service</h2>
            <p>
              Global Inflation Calculator is a web-based tool that provides historical inflation calculations and
              purchasing power comparisons across different currencies and time periods. The Service is provided free of
              charge and is supported by advertising.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily use the Service for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2>Disclaimer</h2>
            <p>
              The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law,
              Global Inflation Calculator excludes all representations, warranties, conditions and terms whether express
              or implied.
            </p>

            <h2>Accuracy of Information</h2>
            <p>
              While we strive to provide accurate historical inflation data, Global Inflation Calculator makes no
              warranties about the completeness, reliability and accuracy of this information. Any action you take upon
              the information on this website is strictly at your own risk.
            </p>

            <h2>Limitations</h2>
            <p>
              In no event shall Global Inflation Calculator or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business interruption) arising out of
              the use or inability to use the Service.
            </p>

            <h2>Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
              Service, to understand our practices.
            </p>

            <h2>Advertising</h2>
            <p>
              The Service is supported by advertising provided by Google AdSense and other advertising partners. We are
              not responsible for the content of advertisements displayed on our Service.
            </p>

            <h2>Modifications</h2>
            <p>
              Global Inflation Calculator may revise these terms of service at any time without notice. By using this
              Service, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2>Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably
              submit to the exclusive jurisdiction of the courts in that state or location.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
              <a href="mailto:legal@globalinflationcalculator.com" className="text-blue-600 hover:underline">
                legal@globalinflationcalculator.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
