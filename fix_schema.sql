-- Fix Schema Script
-- Run this to ensure your database has the correct structure for the new recursive columns feature.
-- It handles cases where 'branches' might already be deleted or renamed.

-- 1. Ensure 'columns' table exists and has correct columns
CREATE TABLE IF NOT EXISTS columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add 'type' column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'columns' AND column_name = 'type') THEN
        ALTER TABLE columns ADD COLUMN type TEXT CHECK (type IN ('branch', 'content', 'dynamic')) DEFAULT 'branch' NOT NULL;
    END IF;
END $$;

-- Add 'parent_item_id' column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'columns' AND column_name = 'parent_item_id') THEN
        ALTER TABLE columns ADD COLUMN parent_item_id UUID;
    END IF;
END $$;

-- 2. Ensure 'column_items' table exists
CREATE TABLE IF NOT EXISTS column_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Handle 'branch_items' -> 'column_items' migration if needed
-- If 'branch_items' exists, we might want to move data, but since 'branches' is gone, 
-- the foreign keys might be broken.
-- Assuming 'column_items' is the source of truth now.

-- 4. Fix 'content_sections' table to use 'column_id' instead of 'item_id'

-- First, add 'column_id' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_sections' AND column_name = 'column_id') THEN
        ALTER TABLE content_sections ADD COLUMN column_id UUID REFERENCES columns(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop the old 'item_id' foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'content_sections_item_id_fkey' 
        AND table_name = 'content_sections'
    ) THEN
        ALTER TABLE content_sections DROP CONSTRAINT content_sections_item_id_fkey;
    END IF;
END $$;

-- Drop the old 'item_id' column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_sections' AND column_name = 'item_id') THEN
        ALTER TABLE content_sections DROP COLUMN item_id;
    END IF;
END $$;

-- 5. Cleanup
-- Drop 'branches' and 'branch_items' if they still exist to avoid confusion
DROP TABLE IF EXISTS branch_items CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
