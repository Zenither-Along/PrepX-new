-- Add total_sections column to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS total_sections INTEGER DEFAULT 0;

-- Update existing assignments with actual counts
UPDATE assignments a
SET total_sections = (
  SELECT COUNT(*)
  FROM columns c
  WHERE c.path_id = a.path_id
  AND c.type = 'content'
)
WHERE total_sections = 0;
