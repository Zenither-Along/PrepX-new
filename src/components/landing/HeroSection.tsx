"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative overflow-hidden">
      {/* Sky Blue Gradient Base - Darker tones */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400" />
      
      {/* Sky Image with Blend Mode */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-40"
        style={{
          backgroundImage: 'url(/hero-sky.jpg)',
          backgroundPosition: 'center top'
        }}
      />
      
      {/* Center darkening for text area */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-transparent to-transparent" />
      
      {/* Gradient fade to background at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% via-transparent via-70% to-white" />
      
      <div className="relative mx-auto max-w-7xl px-6 pt-40 pb-40 sm:pt-48 sm:pb-48">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 px-4 py-2">
            <span className="text-sm text-white font-medium">✨ New: AI-powered learning assistant</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl drop-shadow-lg">
            Turn Learning Chaos Into
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              Structured Clarity
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-white drop-shadow-md">
            PrepX helps you create, organize, and share structured learning paths
            <br />
            so your knowledge stays organized and actionable.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="group bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-base font-semibold shadow-xl">
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg" className="group bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-base font-semibold shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignInButton>
            )}
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-white/50 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 h-12 px-8 text-base font-semibold shadow-lg">
                Explore Public Paths
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </section>
  );
}
