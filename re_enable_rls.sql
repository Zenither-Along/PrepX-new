-- Re-enable RLS (Row Level Security) on all tables
-- Run this in Supabase SQL Editor to restore security

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Note: We're not re-enabling chat_messages because that table 
-- was part of the chat history feature we reverted
