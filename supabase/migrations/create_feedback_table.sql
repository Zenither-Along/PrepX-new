-- Create feedback table for user feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Clerk user ID, nullable for anonymous feedback
  email TEXT, -- For anonymous users or confirmation
  name TEXT,
  type TEXT NOT NULL DEFAULT 'general', -- general, bug, feature, improvement
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional 1-5 star rating
  status TEXT DEFAULT 'open', -- open, in_progress, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (logged in or anonymous)
CREATE POLICY "Anyone can submit feedback" 
  ON feedback FOR INSERT 
  WITH CHECK (true);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" 
  ON feedback FOR SELECT 
  USING (
    user_id IS NOT NULL AND 
    user_id = NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text
  );

-- Only authenticated users can update their own feedback
CREATE POLICY "Users can update own feedback" 
  ON feedback FOR UPDATE 
  USING (
    user_id IS NOT NULL AND 
    user_id = NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text
  );

-- No delete policy - feedback is kept for analytics
