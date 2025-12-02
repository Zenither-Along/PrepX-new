-- Add streak and learning time tracking fields to profiles
-- Adds streak_days, total_minutes_learned, and last_active_date

-- Add streak tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

-- Add total learning time in minutes
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_minutes_learned INTEGER DEFAULT 0;

-- Add last active date for streak calculation
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP WITH TIME ZONE;
