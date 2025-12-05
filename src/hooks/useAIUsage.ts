'use client';

import { useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

// Usage limits for free tier
export const USAGE_LIMITS = {
  chat: { limit: 50, isDaily: true, label: 'AI Chat Messages' },
  quiz: { limit: 10, isDaily: false, label: 'Quiz Generations' },
  path_generation: { limit: 3, isDaily: false, label: 'Path Generations' },
  content_generation: { limit: 20, isDaily: false, label: 'AI Content Section Edits' },
} as const;

export type FeatureType = keyof typeof USAGE_LIMITS;

interface UsageCheckResult {
  allowed: boolean;
  current_count: number;
  limit: number;
  remaining: number;
  reset_at?: string;
}

interface UsageStats {
  [key: string]: {
    count: number;
    period_start: string;
  };
}

export function useAIUsage() {
  const { user } = useUser();
  const supabase = useSupabase();

  /**
   * Check if user can use a feature and increment usage if allowed
   * Returns usage info including remaining count
   */
  const checkAndIncrementUsage = useCallback(async (
    featureType: FeatureType
  ): Promise<UsageCheckResult> => {
    if (!user) {
      return {
        allowed: false,
        current_count: 0,
        limit: 0,
        remaining: 0,
      };
    }

    const config = USAGE_LIMITS[featureType];

    try {
      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: user.id,
        p_feature_type: featureType,
        p_limit: config.limit,
        p_is_daily: config.isDaily,
      });

      if (error) {
        console.error('Error checking usage:', error);
        // On error, allow the request (fail open for beta)
        return {
          allowed: true,
          current_count: 0,
          limit: config.limit,
          remaining: config.limit,
        };
      }

      return data as UsageCheckResult;
    } catch (err) {
      console.error('Usage check failed:', err);
      // Fail open for beta
      return {
        allowed: true,
        current_count: 0,
        limit: config.limit,
        remaining: config.limit,
      };
    }
  }, [user, supabase]);

  /**
   * Get current usage statistics for all features
   */
  const getUsageStats = useCallback(async (): Promise<UsageStats> => {
    if (!user) return {};

    try {
      const { data, error } = await supabase.rpc('get_usage_stats', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error getting usage stats:', error);
        return {};
      }

      return (data as UsageStats) || {};
    } catch (err) {
      console.error('Failed to get usage stats:', err);
      return {};
    }
  }, [user, supabase]);

  /**
   * Get remaining usage for a specific feature
   */
  const getRemainingUsage = useCallback(async (
    featureType: FeatureType
  ): Promise<number> => {
    if (!user) return 0;

    const config = USAGE_LIMITS[featureType];
    const stats = await getUsageStats();
    const featureStats = stats[featureType];

    if (!featureStats) {
      return config.limit;
    }

    // Check if period has reset
    const periodStart = new Date(featureStats.period_start);
    const now = new Date();
    
    if (config.isDaily) {
      // Check if it's a new day
      if (periodStart.toDateString() !== now.toDateString()) {
        return config.limit;
      }
    } else {
      // Check if it's a new month
      if (periodStart.getMonth() !== now.getMonth() || 
          periodStart.getFullYear() !== now.getFullYear()) {
        return config.limit;
      }
    }

    return Math.max(0, config.limit - featureStats.count);
  }, [user, getUsageStats]);

  return {
    checkAndIncrementUsage,
    getUsageStats,
    getRemainingUsage,
    limits: USAGE_LIMITS,
  };
}
