-- Create activity_history table for tracking daily learning activity
-- Stores daily minutes learned and active status for graphs and calendars

CREATE TABLE IF NOT EXISTS public.activity_history (
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  minutes_learned INTEGER DEFAULT 0,
  was_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- Create index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_activity_history_user_date 
ON public.activity_history(user_id, date DESC);

-- Enable RLS
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own activity history
CREATE POLICY "Users can view own activity history"
ON public.activity_history FOR SELECT
USING (auth.uid()::text = user_id);

-- RLS Policy: Users can insert their own activity history
CREATE POLICY "Users can insert own activity history"
ON public.activity_history FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- RLS Policy: Users can update their own activity history
CREATE POLICY "Users can update own activity history"
ON public.activity_history FOR UPDATE
USING (auth.uid()::text = user_id);
