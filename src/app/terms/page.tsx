import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: December 2, 2024</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using PrepX ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              PrepX grants you a personal, non-transferable, and non-exclusive license to use the Service. This license is for your personal or internal business purposes and is subject to these Terms of Service.
            </p>
            <p className="text-gray-700 mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without our consent</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
            </p>
            <p className="text-gray-700 mb-4">
              You are responsible for safeguarding your account password and for any activities or actions under your account. You must notify us immediately upon becoming aware of any breach of security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Content</h2>
            <p className="text-gray-700 mb-4">
              You retain all rights to any content you submit, post, or display on or through the Service. By submitting, posting, or displaying content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content through the Service.
            </p>
            <p className="text-gray-700 mb-4">
              You are solely responsible for your content and the consequences of posting or publishing it. We do not endorse any content or any opinion, recommendation, or advice expressed therein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You agree not to use the Service:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>For any unlawful purpose or in violation of any applicable laws</li>
              <li>To harass, abuse, or harm another person</li>
              <li>To impersonate or attempt to impersonate another user or person</li>
              <li>To upload or transmit viruses or any malicious code</li>
              <li>To interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of PrepX and its licensors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              In no event shall PrepX, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses, resulting from your use or inability to use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes. Your continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at:
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
              <Link href="/terms" className="text-primary font-medium">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
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
