-- Migrate existing activity data from old activity_history table to new user_activity_log table
-- This preserves your existing streak and time tracking data

-- First, check if activity_history table exists and copy data
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_history'
  ) THEN
    -- Copy data from activity_history to user_activity_log
    -- Using INSERT ... ON CONFLICT to avoid duplicates
    INSERT INTO public.user_activity_log (user_id, date, minutes_learned, was_active, created_at)
    SELECT 
      user_id::TEXT,  -- Cast to TEXT since new table uses TEXT for user_id
      date,
      COALESCE(minutes_learned, 0),
      COALESCE(was_active, false),
      COALESCE(created_at, NOW())
    FROM public.activity_history
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
      minutes_learned = GREATEST(EXCLUDED.minutes_learned, user_activity_log.minutes_learned),
      was_active = EXCLUDED.was_active OR user_activity_log.was_active;
    
    RAISE NOTICE 'Successfully migrated data from activity_history to user_activity_log';
  ELSE
    RAISE NOTICE 'Table activity_history does not exist, skipping migration';
  END IF;
END $$;
