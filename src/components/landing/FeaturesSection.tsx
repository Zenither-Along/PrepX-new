"use client";

import { BookOpen, Sparkles, Share2, Zap } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning Paths",
      description: "Create branching, multi-level learning journeys that adapt to your needs"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Assistance",
      description: "Get intelligent help and suggestions as you build your content"
    },
    {
      icon: Share2,
      title: "Share & Collaborate",
      description: "Publish your paths to the community or keep them private"
    },
    {
      icon: Zap,
      title: "Dynamic Content",
      description: "Rich media support: text, images, videos, code snippets, and more"
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center mb-16">
        <div className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4" />
          Our Features
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Everything You Need to Organize Knowledge
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Powerful tools designed to help you plan, structure, and deliver on all your learning goals
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {/* Feature 1: Branching Paths */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all">
          <div className="mb-6 aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-lg shadow-sm p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <div className="h-2 flex-1 bg-blue-200 rounded" />
              </div>
              <div className="ml-6 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <div className="h-2 flex-1 bg-purple-200 rounded" />
              </div>
              <div className="ml-6 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-pink-500" />
                <div className="h-2 flex-1 bg-pink-200 rounded" />
              </div>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Branching Learning Paths</h3>
          <p className="text-sm text-gray-600">
            Create non-linear courses where learners can choose their own adventure based on their interests and skill level.
          </p>
        </div>

        {/* Feature 2: AI Assistant */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all">
          <div className="mb-6 aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 flex items-center justify-center">
            <div className="relative w-full h-full bg-white rounded-lg shadow-sm p-4">
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-2 mt-8">
                <div className="h-2 w-3/4 bg-gray-100 rounded" />
                <div className="h-2 w-1/2 bg-gray-100 rounded" />
                <div className="h-2 w-full bg-emerald-50 rounded" />
              </div>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">AI-Powered Assistance</h3>
          <p className="text-sm text-gray-600">
            Get intelligent suggestions for course structure, content generation, and quiz creation powered by advanced AI.
          </p>
        </div>

        {/* Feature 3: Collaboration */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all">
          <div className="mb-6 aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 flex items-center justify-center">
            <div className="flex -space-x-4">
              <div className="h-12 w-12 rounded-full border-2 border-white bg-orange-200" />
              <div className="h-12 w-12 rounded-full border-2 border-white bg-amber-200" />
              <div className="h-12 w-12 rounded-full border-2 border-white bg-yellow-200 flex items-center justify-center text-xs font-bold text-yellow-700">
                +3
              </div>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Real-time Collaboration</h3>
          <p className="text-sm text-gray-600">
            Work together with your team to build and refine learning paths. Comment, edit, and review in real-time.
          </p>
        </div>

        {/* Feature 4: Rich Content */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all">
          <div className="mb-6 aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-lg shadow-sm p-2 grid grid-cols-2 gap-2">
              <div className="bg-indigo-100 rounded aspect-square" />
              <div className="bg-violet-100 rounded aspect-square" />
              <div className="col-span-2 bg-gray-50 rounded h-full" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Rich Media Support</h3>
          <p className="text-sm text-gray-600">
            Embed videos, code snippets, interactive quizzes, and downloadable resources directly into your lessons.
          </p>
        </div>
      </div>
    </section>
  );
}
