-- =======================================================
-- FIX: Safe Auth ID Extraction (Text vs UUID)
-- =======================================================
-- The error "invalid input syntax for type uuid" confirms that
-- auth.uid() crashes because it tries to cast the Clerk ID (string) to UUID.
--
-- This fix extracts the ID directly from the JWT claims as TEXT.

-- 1. Redefine requesting_user_id to use raw JWT claims
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- Extract 'sub' from the claims JSON to avoid UUID casting
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'sub';
$$;

-- 2. Update Debug Function to show raw claims
DROP FUNCTION IF EXISTS debug_get_user_id();

CREATE OR REPLACE FUNCTION public.debug_get_user_id()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN jsonb_build_object(
    'jwt_claims_raw', current_setting('request.jwt.claims', true),
    'extracted_id', requesting_user_id()
  );
END;
$$;
