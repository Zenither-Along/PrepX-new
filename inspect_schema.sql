-- Inspect the actual column types in the database
SELECT 
    table_name, 
    column_name, 
    data_type, 
    udt_name
FROM 
    information_schema.columns
WHERE 
    table_name IN ('assignments', 'classroom_members', 'profiles', 'assignment_submissions')
    AND column_name IN ('created_by', 'student_id', 'user_id', 'id')
ORDER BY 
    table_name, column_name;
