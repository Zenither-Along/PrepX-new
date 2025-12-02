-- Fix security warning: function_search_path_mutable
-- Explicitly set search_path to empty string to prevent search path hijacking
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;
