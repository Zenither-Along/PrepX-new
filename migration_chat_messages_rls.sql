-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their chat messages" ON chat_messages;

-- Enable RLS on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view chat messages for columns in their own paths
CREATE POLICY "Users can view their chat messages" ON chat_messages
  FOR SELECT USING (
    column_id IN (
      SELECT c.id 
      FROM columns c
      JOIN learning_paths lp ON c.path_id = lp.id
      WHERE lp.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Policy: Users can insert chat messages for columns in their own paths
CREATE POLICY "Users can insert their chat messages" ON chat_messages
  FOR INSERT WITH CHECK (
    column_id IN (
      SELECT c.id 
      FROM columns c
      JOIN learning_paths lp ON c.path_id = lp.id
      WHERE lp.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Policy: Users can delete chat messages for columns in their own paths
CREATE POLICY "Users can delete their chat messages" ON chat_messages
  FOR DELETE USING (
    column_id IN (
      SELECT c.id 
      FROM columns c
      JOIN learning_paths lp ON c.path_id = lp.id
      WHERE lp.user_id = (auth.jwt() ->> 'sub')
    )
  );
