"use client";

import { Profile } from '@/hooks/useProfile';
import { Flame, Calendar } from 'lucide-react';

interface StreakDisplayProps {
  profile: Profile | null;
  loading?: boolean;
}

export function StreakDisplay({ profile, loading }: StreakDisplayProps) {
  if (loading || !profile) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const getMilestone = (days: number) => {
    if (days >= 365) return { label: '🏆 Year Warrior', color: 'text-yellow-500' };
    if (days >= 100) return { label: '💎 Century Club', color: 'text-purple-500' };
    if (days >= 30) return { label: '⭐ Monthly Master', color: 'text-blue-500' };
    if (days >= 7) return { label: '🔥 Week Winner', color: 'text-orange-500' };
    if (days >= 3) return { label: '✨ Getting Started', color: 'text-green-500' };
    return null;
  };

  const milestone = getMilestone(profile.streak_days);

  const getMotivation = () => {
    if (profile.streak_days === 0) return "Start your streak today!";
    if (profile.streak_days === 1) return "Great start! Come back tomorrow.";
    if (profile.streak_days < 7) return "Keep it going!";
    if (profile.streak_days < 30) return "You're on fire!";
    return "Incredible dedication!";
  };

  const formatLastActive = () => {
    if (!profile.last_active_date) return "Never";
    const date = new Date(profile.last_active_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="rounded-xl border bg-linear-to-br from-orange-500/5 via-background to-background overflow-hidden">
      <div className="p-6">
        {/* Streak Number */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Animated Flame */}
            <div className="relative">
              <Flame className={`h-16 w-16 ${
                profile.streak_days > 0 ? 'text-orange-500 animate-pulse' : 'text-muted'
              }`} />
              {profile.streak_days > 7 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {profile.streak_days > 99 ? '99+' : profile.streak_days}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold bg-linear-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {profile.streak_days}
              </span>
              <span className="text-lg text-muted-foreground">day{profile.streak_days !== 1 && 's'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{getMotivation()}</p>
            {milestone && (
              <p className={`text-sm font-medium mt-1 ${milestone.color}`}>
                {milestone.label}
              </p>
            )}
          </div>
        </div>

        {/* Last Active */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last active</span>
          </div>
          <span className="font-medium">{formatLastActive()}</span>
        </div>
      </div>
    </div>
  );
}
