-- Check if tables exist and list their columns
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('quizzes', 'user_activity_log')
ORDER BY 
    table_name, ordinal_position;
