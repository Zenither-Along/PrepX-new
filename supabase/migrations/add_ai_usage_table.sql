-- Migration: Add AI Usage Tracking Table
-- Purpose: Track AI feature usage per user for free tier limits

-- Create enum for feature types
DO $$ BEGIN
  CREATE TYPE ai_feature_type AS ENUM ('chat', 'quiz', 'path_generation', 'content_generation');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  feature_type ai_feature_type NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one record per user per feature
  UNIQUE(user_id, feature_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON ai_usage(user_id, feature_type);

-- Enable RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON ai_usage FOR SELECT
  USING (user_id = (SELECT auth.jwt() ->> 'sub'));

-- Users can insert their own usage records
CREATE POLICY "Users can insert own usage"
  ON ai_usage FOR INSERT
  WITH CHECK (user_id = (SELECT auth.jwt() ->> 'sub'));

-- Users can update their own usage records
CREATE POLICY "Users can update own usage"
  ON ai_usage FOR UPDATE
  USING (user_id = (SELECT auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (SELECT auth.jwt() ->> 'sub'));

-- Function to check and increment usage (atomic operation)
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id TEXT,
  p_feature_type ai_feature_type,
  p_limit INTEGER,
  p_is_daily BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_threshold TIMESTAMP WITH TIME ZONE;
  v_result JSON;
BEGIN
  -- Calculate period threshold (daily or monthly)
  IF p_is_daily THEN
    v_period_threshold := DATE_TRUNC('day', NOW());
  ELSE
    v_period_threshold := DATE_TRUNC('month', NOW());
  END IF;

  -- Try to get existing record
  SELECT usage_count, period_start 
  INTO v_current_count, v_period_start
  FROM ai_usage 
  WHERE user_id = p_user_id AND feature_type = p_feature_type;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO ai_usage (user_id, feature_type, usage_count, period_start)
    VALUES (p_user_id, p_feature_type, 1, NOW());
    
    RETURN json_build_object(
      'allowed', TRUE,
      'current_count', 1,
      'limit', p_limit,
      'remaining', p_limit - 1
    );
  END IF;

  -- Check if period has reset
  IF v_period_start < v_period_threshold THEN
    -- Reset the counter
    UPDATE ai_usage 
    SET usage_count = 1, period_start = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id AND feature_type = p_feature_type;
    
    RETURN json_build_object(
      'allowed', TRUE,
      'current_count', 1,
      'limit', p_limit,
      'remaining', p_limit - 1
    );
  END IF;

  -- Check if limit exceeded
  IF v_current_count >= p_limit THEN
    RETURN json_build_object(
      'allowed', FALSE,
      'current_count', v_current_count,
      'limit', p_limit,
      'remaining', 0,
      'reset_at', CASE 
        WHEN p_is_daily THEN DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
        ELSE DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
      END
    );
  END IF;

  -- Increment usage
  UPDATE ai_usage 
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE user_id = p_user_id AND feature_type = p_feature_type;
  
  RETURN json_build_object(
    'allowed', TRUE,
    'current_count', v_current_count + 1,
    'limit', p_limit,
    'remaining', p_limit - v_current_count - 1
  );
END;
$$;

-- Function to get current usage statistics
CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_object_agg(
    feature_type::TEXT,
    json_build_object(
      'count', usage_count,
      'period_start', period_start
    )
  )
  INTO v_result
  FROM ai_usage
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_result, '{}'::JSON);
END;
$$;
