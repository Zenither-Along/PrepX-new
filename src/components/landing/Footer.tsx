"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Twitter, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_3fr]">
          {/* Brand Section - Left Side */}
          <div>
            <Logo width={140} height={48} />
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
                  <Link href="/#features" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    AI Path Generator
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-sm text-gray-600 hover:text-primary transition-colors">
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
                  <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/#use-cases" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Use Cases
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
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
                  <Link href="/#faq" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
                >
                  <Facebook className="h-4 w-4" />
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
            <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
