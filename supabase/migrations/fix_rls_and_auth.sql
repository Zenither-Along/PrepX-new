-- 1. Create a reliable function to get the Clerk User ID from the JWT
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

-- 2. Drop existing policies on user_activity_log to avoid conflicts
DROP POLICY IF EXISTS "Users can view own activity log" ON user_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity log" ON user_activity_log;
DROP POLICY IF EXISTS "Users can update own activity log" ON user_activity_log;

-- 3. Create new, correct policies using the new function
CREATE POLICY "Users can view own activity log"
ON user_activity_log FOR SELECT
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can insert own activity log"
ON user_activity_log FOR INSERT
WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update own activity log"
ON user_activity_log FOR UPDATE
USING (user_id = get_clerk_user_id());

-- 4. Ensure RLS is enabled
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions (just in case)
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_activity_log TO service_role;
