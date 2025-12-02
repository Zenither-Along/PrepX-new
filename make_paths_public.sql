-- Quick script to make some paths public for testing
-- Run this in your Supabase SQL editor to mark existing paths as public

-- Update the first 20 paths to be public (for testing infinite scroll)
UPDATE learning_paths
SET is_public = true
WHERE id IN (
  SELECT id FROM learning_paths
  ORDER BY created_at DESC
  LIMIT 20
);

-- Verify the update
SELECT id, title, is_public, created_at
FROM learning_paths
WHERE is_public = true
ORDER BY created_at DESC;
