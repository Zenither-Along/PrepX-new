-- =======================================================
-- FIX: Use auth.uid() instead of custom setting
-- =======================================================
-- The previous implementation of requesting_user_id() returned NULL.
-- We will switch to using the standard Supabase auth.uid() function.

-- 1. Redefine requesting_user_id to use auth.uid()
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- Cast uuid to text to match our schema
  SELECT auth.uid()::text;
$$;

-- 2. Update Debug Function to show both for comparison
DROP FUNCTION IF EXISTS debug_get_user_id();

CREATE OR REPLACE FUNCTION public.debug_get_user_id()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN jsonb_build_object(
    'auth_uid', auth.uid(),
    'jwt_claim_sub', current_setting('request.jwt.claim.sub', true),
    'requesting_user_id_func', requesting_user_id()
  );
END;
$$;
