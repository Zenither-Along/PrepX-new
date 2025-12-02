-- 1. Create a STABLE function in PUBLIC schema (not auth)
-- We use public schema because we might not have permissions to modify auth schema
CREATE OR REPLACE FUNCTION public.get_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::text;
$$;

-- 2. Update policies to use the public function
DROP POLICY IF EXISTS "Users can view own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can update own activity log" ON public.user_activity_log;

CREATE POLICY "Users can view own activity log"
ON public.user_activity_log FOR SELECT
USING ( user_id = public.get_user_id() );

CREATE POLICY "Users can insert own activity log"
ON public.user_activity_log FOR INSERT
WITH CHECK ( user_id = public.get_user_id() );

CREATE POLICY "Users can update own activity log"
ON public.user_activity_log FOR UPDATE
USING ( user_id = public.get_user_id() );
