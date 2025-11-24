-- 1. Remove duplicate likes (keeping the oldest one)
DELETE FROM path_likes a USING path_likes b
WHERE a.user_id = b.user_id 
  AND a.path_id = b.path_id 
  AND a.created_at > b.created_at;

-- 2. Ensure Primary Key exists (this enforces uniqueness)
-- We use DO block to avoid error if PK already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'path_likes_pkey') THEN
        ALTER TABLE path_likes ADD PRIMARY KEY (user_id, path_id);
    END IF;
END
$$;
