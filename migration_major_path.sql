-- Add is_major column to learning_paths
ALTER TABLE learning_paths 
ADD COLUMN is_major BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups since we'll query this often
CREATE INDEX idx_learning_paths_is_major ON learning_paths(is_major);
