"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Instagram, Facebook, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_3fr]">
          {/* Brand Section - Left Side */}
          <div>
            <Link href="/">
              <Logo width={140} height={48} forceTheme="light" textColor="text-gray-900" />
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-sm">
              PrepX helps learners and educators create structured learning paths, manage classrooms, and track progress — all in one place.
            </p>
          </div>

          {/* Navigation Sections - Right Side, Grouped Together */}
          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4">
            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/features/ai" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    AI Features
                  </Link>
                </li>
                <li>
                  <Link href="/features/classrooms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Classrooms
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Explore Paths
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About Us</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/blog" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/feedback" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on X (Twitter)"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with spacing */}
        <div className="mt-16 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} PrepX. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
