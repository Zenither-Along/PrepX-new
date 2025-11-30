"use client";

import { Sparkles } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center mb-16">
        <div className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4" />
          Platform Capabilities
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Everything You Need in One Place
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From AI-generated paths to classroom management, PrepX gives you the tools to create, share, and track learning experiences
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {/* Feature 1: Branching Paths */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
            {/* Central node */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 shadow-md z-10" />
            
            {/* Branch lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
              <path d="M 20 50 Q 60 30 100 30" stroke="#a78bfa" strokeWidth="2" fill="none" />
              <path d="M 20 50 Q 60 50 100 50" stroke="#ec4899" strokeWidth="2" fill="none" />
              <path d="M 20 50 Q 60 70 100 70" stroke="#8b5cf6" strokeWidth="2" fill="none" />
            </svg>
            
            {/* Branch nodes */}
            <div className="absolute top-[30%] right-1/3 w-3 h-3 rounded-full bg-purple-400 shadow-sm" />
            <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-pink-500 shadow-sm" />
            <div className="absolute top-[70%] right-1/3 w-3 h-3 rounded-full bg-purple-600 shadow-sm" />
            
            {/* End nodes */}
            <div className="absolute top-[30%] right-8 w-2.5 h-2.5 rounded-full bg-purple-300" />
            <div className="absolute top-1/2 right-8 w-2.5 h-2.5 rounded-full bg-pink-400" />
            <div className="absolute top-[70%] right-8 w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Branching Learning Paths</h3>
          <p className="text-sm text-gray-600">
            Create multi-level, non-linear courses where learners navigate through custom branches. Perfect for adaptive learning experiences tailored to individual needs and skill levels.
          </p>
        </div>

        {/* Feature 2: AI Assistant */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
            {/* AI sparkle animation elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-16 h-16">
                {/* Central sparkle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-lg" />
                
                {/* Orbiting sparkles */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-400 rounded-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-emerald-300 rounded-full" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-teal-300 rounded-full" />
                
                {/* Corner sparkles */}
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-emerald-200 rounded-full" />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-200 rounded-full" />
                <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-cyan-200 rounded-full" />
                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-emerald-200 rounded-full" />
              </div>
            </div>
            
            {/* Pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-emerald-200 opacity-40" />
              <div className="absolute w-32 h-32 rounded-full border-2 border-teal-200 opacity-20" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold">AI-Powered Tools</h3>
          <p className="text-sm text-gray-600">
            Generate complete learning paths instantly with AI. Get contextual help with the AI Chat Assistant while studying. Smart quizzes and personalized content suggestions.
          </p>
        </div>

        {/* Feature 3: Classroom Management */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
            {/* Teacher/main user */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-linear-to-br from-orange-400 to-amber-500 shadow-lg flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/30" />
            </div>
            
            {/* Student circles arranged around */}
            <div className="absolute top-[20%] left-[30%] w-8 h-8 rounded-full bg-linear-to-br from-amber-300 to-yellow-400 shadow-md" />
            <div className="absolute top-[20%] right-[30%] w-8 h-8 rounded-full bg-linear-to-br from-orange-300 to-amber-400 shadow-md" />
            <div className="absolute bottom-[20%] left-[25%] w-8 h-8 rounded-full bg-linear-to-br from-yellow-300 to-amber-300 shadow-md" />
            <div className="absolute bottom-[20%] right-[25%] w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-orange-400 shadow-md" />
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 100">
              <line x1="100" y1="50" x2="60" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="100" y1="50" x2="140" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="100" y1="50" x2="50" y2="80" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="100" y1="50" x2="150" y2="80" stroke="#f59e0b" strokeWidth="1.5" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Classroom Management</h3>
          <p className="text-sm text-gray-600">
            Create classrooms, assign learning paths to students, track student progress, and manage submissions. Built for educators, tutors, and institutions.
          </p>
        </div>

        {/* Feature 4: Rich Content & Progress */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-linear-to-br from-indigo-50 via-violet-50 to-purple-50 p-6 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
            {/* Content cards */}
            <div className="absolute inset-6 grid grid-cols-3 gap-2">
              {/* Video card */}
              <div className="rounded-lg bg-white shadow-sm p-2 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-linear-to-br from-indigo-400 to-indigo-500" />
              </div>
              
              {/* Image card */}
              <div className="rounded-lg bg-white shadow-sm p-2 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-linear-to-br from-violet-400 to-violet-500" />
              </div>
              
              {/* Quiz card */}
              <div className="rounded-lg bg-white shadow-sm p-2 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-linear-to-br from-purple-400 to-purple-500" />
              </div>
              
              {/* Progress bar spanning bottom */}
              <div className="col-span-3 rounded-lg bg-white shadow-sm p-2 flex items-center gap-1">
                <div className="h-1.5 flex-1 rounded-full bg-indigo-200" />
                <div className="h-1.5 flex-1 rounded-full bg-violet-400" />
                <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Rich Content & Progress Tracking</h3>
          <p className="text-sm text-gray-600">
            Embed videos, images, code snippets, and interactive quizzes. Track progress with assignment completion, section checkmarks, and analytics dashboards.
          </p>
        </div>
      </div>
    </section>
  );
}
