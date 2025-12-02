import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: December 2, 2024</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us when you create an account, use our Service, or communicate with us.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Name and email address</li>
              <li>Profile information you choose to add</li>
              <li>Learning paths and educational content you create</li>
              <li>Usage data and activity logs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage patterns and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> We work with third-party service providers (Clerk for authentication, Supabase for database) who help us operate our Service</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect rights, property, or safety</li>
              <li><strong>With Your Consent:</strong> When you give us explicit permission to share specific information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">Our Service uses the following third-party services:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>Supabase:</strong> Database and backend services</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise these rights, please contact us at support@prepx.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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
              <Link href="/privacy" className="text-primary font-medium">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
