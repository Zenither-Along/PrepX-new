-- Create a new table to ensure fresh schema state
-- Using 'user_activity_log' to avoid conflicts with the broken 'activity_history' table

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  minutes_learned INTEGER DEFAULT 0,
  was_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_date 
ON public.user_activity_log(user_id, date DESC);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies using auth.jwt() ->> 'sub' to handle Clerk IDs (which are not UUIDs)
-- This avoids the "invalid input syntax for type uuid" error caused by auth.uid()

CREATE POLICY "Users can view own activity log"
ON public.user_activity_log FOR SELECT
USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can insert own activity log"
ON public.user_activity_log FOR INSERT
WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own activity log"
ON public.user_activity_log FOR UPDATE
USING ((auth.jwt() ->> 'sub') = user_id);
