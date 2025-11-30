"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const { isSignedIn } = useUser();

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-500 to-purple-600 px-6 py-24 text-center shadow-2xl sm:px-16">
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start Building Your Learning Path Today
          </h2>
          <p className="mx-auto mt-6 text-lg text-blue-100">
            Join educators and learners worldwide who are transforming how they teach and learn with PrepX.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-base font-semibold">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-base font-semibold">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
    </section>
  );
}
