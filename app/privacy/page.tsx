import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>Information We Collect</h2>
            <p>
              Global Inflation Calculator ("we," "our," or "us") collects information to provide better services to our
              users. We collect information in the following ways:
            </p>

            <h3>Information You Give Us</h3>
            <ul>
              <li>
                When you use our inflation calculator, we may store your calculation preferences locally in your browser
              </li>
              <li>Any feedback or contact information you provide through our contact forms</li>
            </ul>

            <h3>Information We Get from Your Use of Our Services</h3>
            <ul>
              <li>
                <strong>Device Information:</strong> We collect device-specific information such as your hardware model,
                operating system version, unique device identifiers, and mobile network information
              </li>
              <li>
                <strong>Log Information:</strong> When you use our services, we automatically collect and store certain
                information in server logs, including details of how you used our service, Internet protocol address,
                and cookies
              </li>
              <li>
                <strong>Analytics:</strong> We use Google Analytics to understand how visitors interact with our website
              </li>
            </ul>

            <h2>How We Use Information We Collect</h2>
            <p>We use the information we collect from all of our services to:</p>
            <ul>
              <li>Provide, maintain, protect and improve our services</li>
              <li>Develop new services and features</li>
              <li>Protect Global Inflation Calculator and our users</li>
              <li>Provide you with relevant advertising through Google AdSense</li>
            </ul>

            <h2>Information We Share</h2>
            <p>
              We do not share personal information with companies, organizations and individuals outside of Global
              Inflation Calculator unless one of the following circumstances applies:
            </p>
            <ul>
              <li>
                <strong>With your consent:</strong> We will share personal information when we have your consent
              </li>
              <li>
                <strong>For legal reasons:</strong> We will share personal information if we believe that access, use,
                preservation or disclosure is reasonably necessary
              </li>
            </ul>

            <h2>Advertising</h2>
            <p>
              We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads
              based on your prior visits to our website or other websites. You may opt out of personalized advertising
              by visiting Google's Ads Settings.
            </p>

            <h2>Cookies</h2>
            <p>
              We use cookies and similar technologies to provide and support our services and each of the uses outlined
              and described in this Privacy Policy. You can control cookies through your browser settings and other
              tools.
            </p>

            <h2>Data Security</h2>
            <p>
              We work hard to protect Global Inflation Calculator and our users from unauthorized access to or
              unauthorized alteration, disclosure or destruction of information we hold.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              Our Privacy Policy may change from time to time. We will post any privacy policy changes on this page and,
              if the changes are significant, we will provide a more prominent notice.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <a href="mailto:privacy@globalinflationcalculator.com" className="text-blue-600 hover:underline">
                privacy@globalinflationcalculator.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
