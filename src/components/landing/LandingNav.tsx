"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function LandingNav() {
  const { isSignedIn } = useUser();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 pt-3">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md shadow-lg">
        <div className="flex h-14 items-center justify-between px-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo width={140} height={48} textColor="text-white" />
          </Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
