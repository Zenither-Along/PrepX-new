import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Heart, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4">
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
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About PrepX
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering learners and educators to create structured, effective learning experiences.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We believe that learning should be structured, accessible, and engaging. PrepX makes it easy for anyone to create, share, and follow learning paths that transform the way people acquire knowledge and skills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              PrepX was born from a simple observation: learning online can be overwhelming. With countless resources scattered across the internet, learners often struggle to know where to start and how to progress.
            </p>
            <p className="text-gray-700 mb-4">
              We set out to solve this by creating a platform that brings structure to learning. Whether you're a student preparing for exams, a professional developing new skills, or an educator guiding others, PrepX helps you map out your learning journey with clarity and purpose.
            </p>
            <p className= "text-gray-700">
              Today, PrepX serves learners and educators worldwide, making structured learning accessible to everyone.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-blue-50 rounded-2xl mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learner-First</h3>
              <p className="text-gray-600">
                Every feature we build starts with one question: How can this help learners succeed?
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-green-50 rounded-2xl mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community-Driven</h3>
              <p className="text-gray-600">
                Learning is better together. We foster a community where knowledge is shared and growth is collaborative.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-50 rounded-2xl mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We constantly experiment with new ways to make learning more effective, engaging, and accessible.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Journey</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're here to learn, teach, or both, we're excited to have you. Start creating your learning path today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Paths
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="mx-auto max-w-6xl px-6 py-8">
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
