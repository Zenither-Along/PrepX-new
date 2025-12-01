-- ============================================
-- FIX SECURITY: Mutable Search Path Functions
-- ============================================
-- Fixes 3 critical security warnings

-- 1. Fix requesting_user_id function
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::text;
$$;

-- 2. Fix update_assignment_section_counts (add search_path)
CREATE OR REPLACE FUNCTION public.update_assignment_section_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_path_id UUID;
BEGIN
  -- Determine the path_id based on the operation
  IF (TG_OP = 'DELETE') THEN
    target_path_id := OLD.path_id;
  ELSE
    target_path_id := NEW.path_id;
  END IF;

  -- Only proceed if the column is/was a content column
  IF (TG_OP = 'DELETE' AND OLD.type = 'content') OR 
     (TG_OP = 'INSERT' AND NEW.type = 'content') OR
     (TG_OP = 'UPDATE' AND (OLD.type = 'content' OR NEW.type = 'content')) THEN
    
    -- Update all assignments linked to this path with the new count
    UPDATE assignments
    SET total_sections = (
      SELECT COUNT(*)
      FROM columns
      WHERE path_id = target_path_id
      AND type = 'content'
    )
    WHERE path_id = target_path_id;
    
  END IF;
  
  RETURN NULL;
END;
$$;

-- 3. Fix update_path_likes (add search_path)
CREATE OR REPLACE FUNCTION public.update_path_likes(path_id uuid, adjustment int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE learning_paths
  SET likes = COALESCE(likes, 0) + adjustment
  WHERE id = path_id;
END;
$$;
