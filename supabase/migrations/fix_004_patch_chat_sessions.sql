-- =======================================================
-- FIX: Patch Chat Sessions RLS
-- =======================================================
-- Fixes potential ambiguity in column_id reference
-- and ensures requesting_user_id is STABLE

-- 1. Update requesting_user_id to be STABLE (optimization + correctness)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::text;
$$;

-- 2. Fix Chat Sessions INSERT policy (Explicit column reference)
DROP POLICY IF EXISTS "Users can insert their chat sessions" ON chat_sessions;
CREATE POLICY "Users can insert their chat sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = chat_sessions.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- 3. Fix Chat Messages INSERT policy (Explicit column reference)
DROP POLICY IF EXISTS "Users can insert their chat messages" ON chat_messages;
CREATE POLICY "Users can insert their chat messages" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = chat_messages.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );
