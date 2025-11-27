"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, School } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function RoleSelectionDialog() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { profile, loading: isProfileLoading, createProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Only show if user is logged in, profile is loaded, and no profile exists
    if (isUserLoaded && user && !isProfileLoading && profile === null) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isUserLoaded, user, isProfileLoading, profile]);

  const handleSelectRole = async (role: "student" | "teacher") => {
    setCreating(true);
    try {
      await createProfile(role);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!isUserLoaded || !user) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome to PrepX! 👋</DialogTitle>
          <DialogDescription className="text-center">
            To get started, please tell us how you plan to use PrepX.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
            onClick={() => handleSelectRole("student")}
            disabled={creating}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold">I'm a Student</div>
              <div className="text-xs text-muted-foreground mt-1">
                I want to learn and track my progress
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
            onClick={() => handleSelectRole("teacher")}
            disabled={creating}
          >
            <School className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold">I'm an Educator</div>
              <div className="text-xs text-muted-foreground mt-1">
                I want to create classes and assign work
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
