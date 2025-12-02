-- Create index for public paths sorted by likes
-- This optimizes the main explore page query: .eq("is_public", true).order("likes", { ascending: false })

CREATE INDEX IF NOT EXISTS idx_learning_paths_public_likes 
ON learning_paths (is_public, likes DESC)
WHERE is_public = true;

-- Also add index for title search if it doesn't exist (using gin for text search would be better but simple index helps ilike with prefix)
CREATE INDEX IF NOT EXISTS idx_learning_paths_title 
ON learning_paths (title);

-- Index for tags array
CREATE INDEX IF NOT EXISTS idx_learning_paths_tags 
ON learning_paths USING GIN (tags);
