import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

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

/**
 * Server-side function to check and increment AI usage
 * Returns null if user is not authenticated
 */
export async function checkAndIncrementUsage(
  featureType: FeatureType
): Promise<UsageCheckResult | null> {
  const { userId, getToken } = await auth();
  
  if (!userId) {
    return null;
  }

  const config = USAGE_LIMITS[featureType];

  try {
    const token = await getToken();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data, error } = await supabase.rpc('check_and_increment_usage', {
      p_user_id: userId,
      p_feature_type: featureType,
      p_limit: config.limit,
      p_is_daily: config.isDaily,
    });

    if (error) {
      console.error('Error checking usage:', error);
      // Fail open for beta - allow the request
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
}

/**
 * Create a 429 response for rate limiting
 */
export function createLimitExceededResponse(
  featureType: FeatureType,
  usageResult: UsageCheckResult
): Response {
  const config = USAGE_LIMITS[featureType];
  const resetPeriod = config.isDaily ? 'tomorrow' : 'next month';
  
  return new Response(
    JSON.stringify({
      error: 'Usage limit exceeded',
      message: `You've reached your ${config.label.toLowerCase()} limit for this ${config.isDaily ? 'day' : 'month'}.`,
      limit: usageResult.limit,
      current: usageResult.current_count,
      reset_at: usageResult.reset_at,
      reset_period: resetPeriod,
      feature: featureType,
    }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
