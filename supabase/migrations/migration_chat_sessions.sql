-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id uuid REFERENCES columns(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions (using Clerk ID)
CREATE POLICY "Users can view their chat sessions" ON chat_sessions
  FOR SELECT USING (
    column_id IN (
      SELECT c.id 
      FROM columns c
      JOIN learning_paths lp ON c.path_id = lp.id
      WHERE lp.user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can insert their chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    column_id IN (
      SELECT c.id 
      FROM columns c
      JOIN learning_paths lp ON c.path_id = lp.id
      WHERE lp.user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can delete their chat sessions" ON chat_sessions
  FOR DELETE USING (
    column_id IN (
      SELECT c.id 
      FROM columns c
      JOIN learning_paths lp ON c.path_id = lp.id
      WHERE lp.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Add session_id to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE;

-- Update RLS policies for chat_messages to check session ownership via column_id
-- (Existing policies check column_id directly, which is still valid, but we might want to ensure session integrity)
-- For now, existing policies on chat_messages are fine as they check column_id which is propagated.

-- Function to migrate existing messages to a default session
DO $$
DECLARE
  rec RECORD;
  new_session_id uuid;
BEGIN
  -- For each unique column_id in chat_messages that doesn't have a session_id
  FOR rec IN SELECT DISTINCT column_id FROM chat_messages WHERE session_id IS NULL LOOP
    IF rec.column_id IS NOT NULL THEN
      -- Create a new session for this column
      INSERT INTO chat_sessions (column_id, title, created_at)
      VALUES (rec.column_id, 'Previous Conversation', now())
      RETURNING id INTO new_session_id;

      -- Update messages to belong to this session
      UPDATE chat_messages 
      SET session_id = new_session_id 
      WHERE column_id = rec.column_id AND session_id IS NULL;
    END IF;
  END LOOP;
END $$;
