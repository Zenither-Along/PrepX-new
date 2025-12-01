-- =======================================================
-- FIX: Add user_id to Chat Sessions
-- =======================================================
-- Adds user_id to chat_sessions to support multi-user chat
-- and simplify RLS policies.

-- 1. Add user_id column
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id text;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- 3. Update RLS for chat_sessions
DROP POLICY IF EXISTS "Users can insert their chat sessions" ON chat_sessions;
CREATE POLICY "Users can insert their chat sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT requesting_user_id())
  );

DROP POLICY IF EXISTS "Users can view their chat sessions" ON chat_sessions;
CREATE POLICY "Users can view their chat sessions" ON chat_sessions
  FOR SELECT
  USING (
    user_id = (SELECT requesting_user_id())
  );

DROP POLICY IF EXISTS "Users can delete their chat sessions" ON chat_sessions;
CREATE POLICY "Users can delete their chat sessions" ON chat_sessions
  FOR DELETE
  USING (
    user_id = (SELECT requesting_user_id())
  );

-- 4. Update RLS for chat_messages (depend on session ownership)
DROP POLICY IF EXISTS "Users can view their chat messages" ON chat_messages;
CREATE POLICY "Users can view their chat messages" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
      AND s.user_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Users can insert their chat messages" ON chat_messages;
CREATE POLICY "Users can insert their chat messages" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = session_id
      AND s.user_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Users can delete their chat messages" ON chat_messages;
CREATE POLICY "Users can delete their chat messages" ON chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
      AND s.user_id = (SELECT requesting_user_id())
    )
  );
