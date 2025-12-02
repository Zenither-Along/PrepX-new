"use client";

import { Profile } from '@/hooks/useProfile';
import { StreakDisplay } from './StreakDisplay';

interface ProfileSimpleStatsProps {
  profile: Profile | null;
  loading?: boolean;
}

export function ProfileSimpleStats({ profile, loading }: ProfileSimpleStatsProps) {
  return (
    <div>
      {/* Streak Display */}
      <StreakDisplay profile={profile} loading={loading} />
    </div>
  );
}
