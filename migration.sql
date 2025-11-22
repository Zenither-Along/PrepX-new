-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Create new tables
-- DROP existing tables to ensure schema is fresh and correct
DROP TABLE IF EXISTS column_items CASCADE;
DROP TABLE IF EXISTS columns CASCADE;

CREATE TABLE IF NOT EXISTS columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  parent_item_id UUID, -- References column_items(id)
  type TEXT CHECK (type IN ('branch', 'content', 'dynamic')) NOT NULL,
  title TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS column_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Migrate Data
-- A. Migrate Root Branches -> Root Columns
INSERT INTO columns (id, path_id, type, title, order_index)
SELECT id, path_id, 'branch', title, order_index
FROM branches;

-- B. Migrate Top-Level Items -> Column Items
INSERT INTO column_items (id, column_id, title, order_index)
SELECT id, branch_id, title, order_index
FROM branch_items
WHERE parent_item_id IS NULL;

-- C. Migrate Sub-Branches (Items that have children)
-- Create a new column for each item that acted as a parent
INSERT INTO columns (path_id, parent_item_id, type, title, order_index)
SELECT DISTINCT b.path_id, bi.parent_item_id, 'branch', 'Sub-branch', 0
FROM branch_items bi
JOIN branches b ON bi.branch_id = b.id
WHERE bi.parent_item_id IS NOT NULL;

-- Move sub-items to these new columns
-- We need to update the column_id of the inserted items to match the new columns
-- This requires a more complex update, so for now we will insert them linked to the new columns
INSERT INTO column_items (id, column_id, title, order_index)
SELECT bi.id, c.id, bi.title, bi.order_index
FROM branch_items bi
JOIN columns c ON c.parent_item_id = bi.parent_item_id
WHERE bi.parent_item_id IS NOT NULL;

-- D. Migrate Content Sections
-- Add column_id to content_sections
ALTER TABLE content_sections ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES columns(id) ON DELETE CASCADE;

-- Create 'content' columns for items that have content sections
INSERT INTO columns (path_id, parent_item_id, type, title, order_index)
SELECT DISTINCT lp.id, cs.item_id, 'content', 'Content', 0
FROM content_sections cs
JOIN branch_items bi ON cs.item_id = bi.id
JOIN branches b ON bi.branch_id = b.id
JOIN learning_paths lp ON b.path_id = lp.id;

-- Update content_sections to point to the new columns
UPDATE content_sections cs
SET column_id = c.id
FROM columns c
WHERE cs.item_id = c.parent_item_id AND c.type = 'content';

-- 3. Cleanup (Optional - Uncomment if you want to delete old tables immediately)
-- DROP TABLE branch_items CASCADE;
-- DROP TABLE branches CASCADE;
-- ALTER TABLE content_sections DROP COLUMN item_id;
