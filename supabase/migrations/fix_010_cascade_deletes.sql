-- Fix cascade delete for content_sections
-- When a column is deleted, all its content_sections should also be deleted

-- Step 1: Clean up orphaned records first

-- Delete content_sections that reference non-existent columns
DELETE FROM content_sections
WHERE column_id NOT IN (SELECT id FROM columns);

-- Delete column_items that reference non-existent columns
DELETE FROM column_items
WHERE column_id NOT IN (SELECT id FROM columns);

-- Delete columns that reference non-existent paths
DELETE FROM columns
WHERE path_id NOT IN (SELECT id FROM learning_paths);

-- Step 2: Drop existing foreign key constraints

ALTER TABLE content_sections 
DROP CONSTRAINT IF EXISTS content_sections_column_id_fkey;

ALTER TABLE column_items
DROP CONSTRAINT IF EXISTS column_items_column_id_fkey;

ALTER TABLE columns
DROP CONSTRAINT IF EXISTS columns_path_id_fkey;

-- Step 3: Add foreign key constraints with ON DELETE CASCADE

-- content_sections cascade from columns
ALTER TABLE content_sections
ADD CONSTRAINT content_sections_column_id_fkey 
FOREIGN KEY (column_id) 
REFERENCES columns(id) 
ON DELETE CASCADE;

-- column_items cascade from columns
ALTER TABLE column_items
ADD CONSTRAINT column_items_column_id_fkey
FOREIGN KEY (column_id)
REFERENCES columns(id)
ON DELETE CASCADE;

-- columns cascade from learning_paths
ALTER TABLE columns
ADD CONSTRAINT columns_path_id_fkey
FOREIGN KEY (path_id)
REFERENCES learning_paths(id)
ON DELETE CASCADE;
