-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own section progress" ON assignment_section_progress;
DROP POLICY IF EXISTS "Students can update own section progress" ON assignment_section_progress;
DROP POLICY IF EXISTS "Teachers can view student progress" ON assignment_section_progress;

-- Recreate policies using request.jwt.claims for Clerk IDs
-- Students can view their own progress
CREATE POLICY "Students can view own section progress"
  ON assignment_section_progress FOR SELECT
  USING (student_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Students can insert/update their own progress
CREATE POLICY "Students can update own section progress"
  ON assignment_section_progress FOR ALL
  USING (student_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Teachers can view their students' progress
CREATE POLICY "Teachers can view student progress"
  ON assignment_section_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.id = assignment_section_progress.assignment_id
      AND a.created_by = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
