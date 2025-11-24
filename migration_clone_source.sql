-- Add original_path_id to track clones
ALTER TABLE learning_paths
ADD COLUMN original_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL;
