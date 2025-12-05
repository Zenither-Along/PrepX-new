'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap, Clock } from "lucide-react";
import { USAGE_LIMITS, FeatureType } from "@/hooks/useAIUsage";
import Link from "next/link";

interface UsageLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: FeatureType;
  resetAt?: string;
}

export function UsageLimitDialog({
  open,
  onOpenChange,
  feature,
  resetAt,
}: UsageLimitDialogProps) {
  const config = USAGE_LIMITS[feature];
  const resetPeriod = config.isDaily ? 'tomorrow' : 'next month';
  
  // Format reset time if provided
  const formattedResetTime = resetAt 
    ? new Date(resetAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : resetPeriod;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-center">Usage Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;ve used all your {config.label.toLowerCase()} for{' '}
            {config.isDaily ? 'today' : 'this month'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current limit info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{config.label}</p>
                <p className="text-sm text-muted-foreground">
                  {config.limit} per {config.isDaily ? 'day' : 'month'}
                </p>
              </div>
            </div>
          </div>

          {/* Reset time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Resets {formattedResetTime}</span>
          </div>

          {/* Upgrade prompt */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">
              Want unlimited access?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to Pro for unlimited AI features (coming soon!)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/pricing" className="w-full">
            <Button className="w-full" variant="default">
              View Plans
            </Button>
          </Link>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
