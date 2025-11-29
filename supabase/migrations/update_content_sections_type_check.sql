-- Drop the existing check constraint
ALTER TABLE content_sections DROP CONSTRAINT IF EXISTS content_sections_type_check;

-- Add the updated check constraint including 'rich-text'
ALTER TABLE content_sections ADD CONSTRAINT content_sections_type_check 
CHECK (type IN (
  'heading', 
  'subheading', 
  'paragraph', 
  'image', 
  'video', 
  'link', 
  'list', 
  'code', 
  'qna', 
  'table', 
  'rich-text'
));
