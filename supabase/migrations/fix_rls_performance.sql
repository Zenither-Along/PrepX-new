-- 1. Create a STABLE function to get the current user ID
-- This function is marked as STABLE, meaning Postgres knows it will return the same result
-- for all rows in a single statement. This prevents re-evaluation of auth.jwt() for every row.

CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::text;
$$;

-- 2. Update RLS policies to use this stable function
-- This resolves the "Auth RLS Initialization Plan" warning.

DROP POLICY IF EXISTS "Users can view own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can update own activity log" ON public.user_activity_log;

CREATE POLICY "Users can view own activity log"
ON public.user_activity_log FOR SELECT
USING ( user_id = auth.user_id() );

CREATE POLICY "Users can insert own activity log"
ON public.user_activity_log FOR INSERT
WITH CHECK ( user_id = auth.user_id() );

CREATE POLICY "Users can update own activity log"
ON public.user_activity_log FOR UPDATE
USING ( user_id = auth.user_id() );
