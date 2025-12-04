import Link from "next/link";
import { ArrowLeft, Sparkles, MessageSquare, GraduationCap, Lightbulb, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Features | PrepX",
  description: "Discover PrepX's powerful AI features including intelligent path generation, adaptive chat assistance, and smart content creation for personalized learning.",
};

export default function AIFeaturesPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo width={140} height={48} />
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Intelligent AI Features
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Experience the future of learning with AI that adapts to your needs, generates personalized content, and provides intelligent assistance every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* AI Path Generator */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Path Generator
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Type a topic like "Python for Beginners" or "World War II", hit generate, and watch as AI builds a complete course in seconds with structured modules, detailed content, code examples, and quizzes—all tailored to your chosen difficulty level.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Choose between beginner, intermediate, or expert level content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Control path structure: set number of modules, topics, and depth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Automatically includes code snippets, rich text content, and practice questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Edit and customize every section after generation</span>
                </li>
              </ul>
            </div>

            {/* Intelligent Chat Assistant */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Intelligent Chat Assistant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ask questions anytime while learning—AI already knows what you're studying. Stuck on a coding problem? Need clarification on a concept? Want real-world examples? Your AI tutor references your current lesson and learning history to provide perfectly contextualized answers, not generic responses.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>AI reads your current path and knows exactly where you are</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Switch between teaching styles instantly (Socratic, ELI5, Expert, Quiz)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Get answers enriched with web search for current information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Access complete chat history across all your learning sessions</span>
                </li>
              </ul>
            </div>

            {/* Adaptive Teaching Modes */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Adaptive Teaching Modes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                One question, five ways to answer. Pick the teaching style that matches your mood and learning needs. Want to think deeply? Try Socratic. Need it simple? Use ELI5. Feeling technical? Go Expert. Want to test yourself? Switch to Quiz mode. Same AI, completely different learning experience.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Socratic:</strong> AI guides you with questions until you discover the answer yourself</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>ELI5:</strong> Explains concepts like you're five—using everyday analogies and simple language</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Expert:</strong> Deep technical explanations with jargon, formulas, and advanced concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Quiz:</strong> AI tests your understanding with follow-up questions on key points</span>
                </li>
              </ul>
            </div>

            {/* Smart Content Creation */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Editor
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                While editing a path, click any section and access AI tools instantly. Ask AI to expand a topic with more details, simplify complex explanations, add real-world examples, or improve clarity. Each section has its own AI assistant—just select the section and choose what you need.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Click any section → Access AI panel with editing options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Expand: AI adds more depth and details to existing content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Simplify: Break down complex concepts into easier language</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Add Examples: Get real-world scenarios and use cases instantly</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
            <Lightbulb className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Experience AI-Powered Learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Start using PrepX's intelligent AI features today and transform the way you learn. Create your first AI-generated path in minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
