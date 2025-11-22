-- Add subheading to content_sections type check constraint

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the check constraint on the 'type' column
    SELECT con.conname INTO constraint_name
    FROM pg_catalog.pg_constraint con
    INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'content_sections'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%type%';

    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE content_sections DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;

    -- Add the new constraint including 'subheading'
    ALTER TABLE content_sections 
    ADD CONSTRAINT content_sections_type_check 
    CHECK (type IN ('heading', 'subheading', 'paragraph', 'image', 'video', 'link', 'list', 'code', 'qna'));
END $$;
