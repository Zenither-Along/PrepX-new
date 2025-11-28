-- Check if total_sections column exists and its values
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'assignments';

-- Check values for assignments
SELECT id, title, total_sections FROM assignments;
