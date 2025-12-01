-- =======================================================
-- FIX: Clean Chat Policies (Force Reset)
-- =======================================================
-- Drops ALL existing policies to ensure no conflicts.
-- Re-applies the simple user_id based policies.

-- 1. Reset chat_sessions policies
DROP POLICY IF EXISTS "Users can insert their chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Authenticated users full access to own chat sessions" ON chat_sessions; -- Potential old name
DROP POLICY IF EXISTS "Users can view their chat sessions based on column" ON chat_sessions; -- Potential old name
DROP POLICY IF EXISTS "Users can insert their chat sessions based on column" ON chat_sessions; -- Potential old name

-- Re-create simple policies
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

-- 2. Reset chat_messages policies
DROP POLICY IF EXISTS "Users can view their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users full access to own chat messages" ON chat_messages; -- Potential old name

-- Re-create simple policies (dependent on session)
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
