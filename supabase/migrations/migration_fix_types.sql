-- Fix column types to support Clerk IDs (text) instead of UUIDs

-- 1. Drop ALL policies that might depend on these columns first
DROP POLICY IF EXISTS "Teachers can manage assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view and update their own submissions" ON assignment_submissions;

-- 2. Fix assignments table
-- We need to drop the constraint if it exists (in case it was referencing profiles.id)
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_created_by_fkey;

-- Now alter the column type to text
ALTER TABLE assignments ALTER COLUMN created_by TYPE text;

-- 3. Fix assignment_submissions table
ALTER TABLE assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_student_id_fkey;
ALTER TABLE assignment_submissions ALTER COLUMN student_id TYPE text;

-- 4. Verify classroom_members (just in case)
ALTER TABLE classroom_members ALTER COLUMN student_id TYPE text;

-- 5. Re-apply RLS policies
CREATE POLICY "Teachers can manage assignments in their classrooms" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = assignments.classroom_id
      AND classrooms.teacher_id = auth.uid()::text
    )
  );

CREATE POLICY "Students can view assignments in their classrooms" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_members.classroom_id = assignments.classroom_id
      AND classroom_members.student_id = auth.uid()::text
    )
  );

CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN classrooms ON classrooms.id = assignments.classroom_id
      WHERE assignments.id = assignment_submissions.assignment_id
      AND classrooms.teacher_id = auth.uid()::text
    )
  );

CREATE POLICY "Students can view and update their own submissions" ON assignment_submissions
  FOR ALL USING (student_id = auth.uid()::text);
