import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo width={140} height={48} forceTheme="light" textColor="text-gray-900" />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: December 2, 2024</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              PrepX uses cookies to enhance your experience and improve our Service. We use cookies for the following purposes:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>User authentication and account management</li>
              <li>Security features</li>
              <li>Session management</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Functional Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies allow us to remember your preferences and provide enhanced features:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Your theme preferences (light/dark mode)</li>
              <li>Language settings</li>
              <li>Personalized content</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies help us understand how visitors use our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Bounce rates and user engagement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use services from third parties that may set their own cookies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Clerk:</strong> Authentication cookies for user login and session management</li>
              <li><strong>Vercel:</strong> Performance and analytics cookies</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These third parties have their own cookie policies which we recommend you review.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in various ways:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Browser Settings</h3>
            <p className="text-gray-700 mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>View what cookies are stored</li>
              <li>Delete cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Disabling Cookies</h3>
            <p className="text-gray-700 mb-4">
              Please note that if you choose to block cookies, some features of our Service may not function properly. Essential cookies cannot be disabled as they are necessary for the Service to work.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How to Control Cookies</h2>
            <p className="text-gray-700 mb-4">
              Here's how to manage cookies in popular browsers:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> support@prepx.com
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} PrepX. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-primary font-medium">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
