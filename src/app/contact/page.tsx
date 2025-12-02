import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600">
            Have questions? We'd love to hear from you. Here's how you can reach us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Email */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Email Us</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Send us an email and we'll get back to you within 24-48 hours.
            </p>
            <a 
              href="mailto:support@prepx.com"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              support@prepx.com
            </a>
          </div>

          {/* Social Media */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Social Media</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Follow us and send us a message on your favorite platform.
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://twitter.com/prepx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                @prepx on X (Twitter)
              </a>
              <a 
                href="https://instagram.com/prepx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                @prepx on Instagram
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Note */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Looking for answers?
          </h3>
          <p className="text-gray-600 mb-4">
            Check out our FAQ section for quick answers to common questions.
          </p>
          <Link href="/#faq">
            <Button variant="outline">
              View FAQ
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} PrepX. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
