-- Add community columns to learning_paths
ALTER TABLE learning_paths 
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN likes INTEGER DEFAULT 0,
ADD COLUMN clones INTEGER DEFAULT 0,
ADD COLUMN author_name TEXT;

-- Index for searching public paths
CREATE INDEX idx_learning_paths_public ON learning_paths(is_public);
CREATE INDEX idx_learning_paths_tags ON learning_paths USING GIN(tags);
