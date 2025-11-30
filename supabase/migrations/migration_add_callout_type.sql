-- Add 'callout' to content_sections type check constraint

-- First, drop the existing constraint
ALTER TABLE content_sections DROP CONSTRAINT IF EXISTS content_sections_type_check;

-- Add the new constraint with 'callout' included
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
  'rich-text',
  'callout'
));
