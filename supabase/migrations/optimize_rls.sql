-- Optimize RLS policies to prevent re-evaluation of auth.jwt() for every row
-- We'll drop the old policies and recreate them with a slightly more optimized structure
-- or simply by ensuring the query planner knows this is a stable comparison.

DROP POLICY IF EXISTS "Users can view own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can update own activity log" ON public.user_activity_log;

-- Re-create policies
-- Using a simple comparison is usually fine, but to strictly avoid the warning,
-- we can ensure the casting is clear.
-- Note: The warning often appears for JSON extraction.
-- We'll use a slightly different syntax that is often better optimized.

CREATE POLICY "Users can view own activity log"
ON public.user_activity_log FOR SELECT
USING (
  user_id = (select auth.jwt() ->> 'sub')
);

CREATE POLICY "Users can insert own activity log"
ON public.user_activity_log FOR INSERT
WITH CHECK (
  user_id = (select auth.jwt() ->> 'sub')
);

CREATE POLICY "Users can update own activity log"
ON public.user_activity_log FOR UPDATE
USING (
  user_id = (select auth.jwt() ->> 'sub')
);
