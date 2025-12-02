-- Inspect columns for classroom_members and quizzes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('classroom_members', 'quizzes');
