"use client";

import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useTimeTracker } from '@/hooks/useTimeTracker';

export function ActivityTrackerWrapper({ children }: { children: React.ReactNode }) {
  useActivityTracker();
  useTimeTracker();
  return <>{children}</>;
}
