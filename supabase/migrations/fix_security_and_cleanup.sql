-- 1. Fix Security Warning: Function Search Path Mutable
-- This ensures the function runs with a secure search path, preventing potential hijacking
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- 2. Cleanup: Drop the old, unused table
-- We switched to 'user_activity_log' to fix the UUID/TEXT type mismatch.
-- 'activity_history' is no longer used by the application.
DROP TABLE IF EXISTS public.activity_history;
