-- FINAL FIX SCRIPT
-- This script drops ALL related policies to ensure we can alter column types safely.

-- 1. Drop ALL policies on assignments
DROP POLICY IF EXISTS "Teachers can manage assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments in their classrooms" ON assignments;

-- 2. Drop ALL policies on assignment_submissions
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view and update their own submissions" ON assignment_submissions;

-- 3. Drop ALL policies on classroom_members (The source of the latest error)
DROP POLICY IF EXISTS "Teachers can view students in their classrooms" ON classroom_members;
DROP POLICY IF EXISTS "Students can view their own memberships" ON classroom_members;
DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_members;

-- 4. Fix assignments table
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_created_by_fkey;
ALTER TABLE assignments ALTER COLUMN created_by TYPE text;

-- 5. Fix assignment_submissions table
ALTER TABLE assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_student_id_fkey;
ALTER TABLE assignment_submissions ALTER COLUMN student_id TYPE text;

-- 6. Fix classroom_members table
ALTER TABLE classroom_members ALTER COLUMN student_id TYPE text;

-- 7. Re-apply RLS policies for assignments
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

-- 8. Re-apply RLS policies for assignment_submissions
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

-- 9. Re-apply RLS policies for classroom_members
CREATE POLICY "Teachers can view students in their classrooms" ON classroom_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = classroom_members.classroom_id
      AND classrooms.teacher_id = auth.uid()::text
    )
  );

CREATE POLICY "Students can view their own memberships" ON classroom_members
  FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Students can join classrooms" ON classroom_members
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);
