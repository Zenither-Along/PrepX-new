import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles, Zap, Crown } from "lucide-react";

export const metadata = {
  title: "Pricing - PrepX",
  description: "Choose the plan that's right for you. Start learning for free.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with structured learning",
    badge: "Current Plan",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    features: [
      { text: "50 AI chat messages per day", included: true },
      { text: "10 quiz generations per month", included: true },
      { text: "3 AI path generations per month", included: true },
      { text: "20 AI content section edits per month", included: true },
      { text: "Unlimited learning paths", included: true },
      { text: "Community explore page", included: true },
      { text: "Basic progress tracking", included: true },
    ],
    cta: "Get Started",
    ctaLink: "/",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "",
    period: "",
    description: "For serious learners and educators who need more power",
    badge: "Coming Soon",
    badgeColor: "bg-primary/10 text-primary",
    features: [
      { text: "Unlimited AI chat messages", included: true },
      { text: "Unlimited quiz generations", included: true },
      { text: "Unlimited AI path generations", included: true },
      { text: "Unlimited AI content section edits", included: true },
      { text: "Priority AI responses", included: true },
      { text: "Advanced analytics", included: true },
    ],
    cta: "Coming Soon",
    ctaLink: null,
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo width={140} height={48} />
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
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Start Learning for Free
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get started with our generous free tier. Upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-linear-to-br from-primary/5 via-primary/10 to-purple-500/10 border-2 border-primary/20 shadow-xl shadow-primary/5"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg"
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${plan.badgeColor}`}
                >
                  {plan.highlighted ? <Crown className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                  {plan.badge}
                </span>
              </div>

              {/* Plan Name & Price */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h2>
              {plan.price && (
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className={`shrink-0 mt-0.5 ${
                      feature.included 
                        ? "text-green-500" 
                        : "text-gray-300 dark:text-gray-700"
                    }`}>
                      <Check className="h-5 w-5" />
                    </div>
                    <span className={`text-sm ${
                      feature.included 
                        ? "text-gray-700 dark:text-gray-300" 
                        : "text-gray-400 dark:text-gray-600"
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.ctaLink ? (
                <Link href={plan.ctaLink} className="block">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  disabled
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens when I hit my usage limit?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ll see a friendly message letting you know you&apos;ve reached your limit. 
                Daily limits reset at midnight, and monthly limits reset on the 1st of each month.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I create unlimited learning paths on the free plan?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can create and manage as many learning paths as you want. 
                The limits only apply to AI-powered features like chat and content generation.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                When will the Pro plan be available?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We&apos;re working on bringing Pro features to you soon! 
                Stay tuned for updates as we continue to improve PrepX.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} PrepX. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
