-- =======================================================
-- FIX: Consolidated Chat Fix & Debug
-- =======================================================
-- 1. Ensures user_id column exists
-- 2. Resets all chat policies
-- 3. Adds debug function to verify auth

-- 1. Ensure user_id column exists
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id text;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- 2. Ensure requesting_user_id is correct
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::text;
$$;

-- 3. Debug Function: Check what the server sees
CREATE OR REPLACE FUNCTION public.debug_get_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT requesting_user_id();
$$;

-- 4. Reset Policies (Force Clean)
DROP POLICY IF EXISTS "Users can insert their chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Authenticated users full access to own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their chat sessions based on column" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their chat sessions based on column" ON chat_sessions;

CREATE POLICY "Users can insert their chat sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT requesting_user_id())
  );

CREATE POLICY "Users can view their chat sessions" ON chat_sessions
  FOR SELECT
  USING (
    user_id = (SELECT requesting_user_id())
  );

CREATE POLICY "Users can delete their chat sessions" ON chat_sessions
  FOR DELETE
  USING (
    user_id = (SELECT requesting_user_id())
  );

-- 5. Reset Message Policies
DROP POLICY IF EXISTS "Users can view their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their chat messages" ON chat_messages;

CREATE POLICY "Users can view their chat messages" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
      AND s.user_id = (SELECT requesting_user_id())
    )
  );

CREATE POLICY "Users can insert their chat messages" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = session_id
      AND s.user_id = (SELECT requesting_user_id())
    )
  );

CREATE POLICY "Users can delete their chat messages" ON chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
      AND s.user_id = (SELECT requesting_user_id())
    )
  );
