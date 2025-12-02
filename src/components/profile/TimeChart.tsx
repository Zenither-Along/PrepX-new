"use client";

import { useProfile } from '@/hooks/useProfile';
import { Clock, TrendingUp } from 'lucide-react';

export function TimeChart() {
  const { profile, loading } = useProfile();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (loading || !profile) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Clock className="h-5 w-5 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold">Learning Time</h3>
      </div>

      {/* Main Stat */}
      <div className="text-center py-8">
        <div className="text-5xl font-bold bg-linear-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
          {formatTime(profile.total_minutes_learned)}
        </div>
        <p className="text-muted-foreground">Total time learned</p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>Auto-tracking enabled</span>
        </div>
      </div>
    </div>
  );
}
