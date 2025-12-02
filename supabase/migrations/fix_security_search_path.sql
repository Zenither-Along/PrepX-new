-- Fix Security Warning: Function Search Path Mutable
-- We need to set a fixed search_path for the function to prevent potential hijacking.
-- This is a best practice for all security-critical functions.

CREATE OR REPLACE FUNCTION public.get_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE 
SET search_path = ''
AS $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::text;
$$;
