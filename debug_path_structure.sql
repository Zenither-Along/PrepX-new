-- This query shows the structure of your learning path
-- It will help us understand how to count only "active" content columns

SELECT 
  c.id as column_id,
  c.type,
  c.parent_item_id,
  ci.id as parent_item_id_ref,
  ci.title as accessed_from_item
FROM columns c
LEFT JOIN column_items ci ON ci.id = c.parent_item_id
WHERE c.path_id = 'YOUR_PATH_ID_HERE'
ORDER BY c.type, c.created_at;
