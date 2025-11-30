-- Fix RLS policies to use Clerk ID from JWT instead of auth.uid()
-- auth.uid() expects a UUID, but Clerk IDs are text (e.g. "user_..."), causing "invalid input syntax for type uuid"

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Teachers can manage assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view and update their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view students in their classrooms" ON classroom_members;
DROP POLICY IF EXISTS "Students can view their own memberships" ON classroom_members;
DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_members;

-- 2. Recreate policies using auth.jwt() ->> 'sub' (which extracts the Clerk ID as text)

-- Assignments Policies
CREATE POLICY "Teachers can manage assignments in their classrooms" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = assignments.classroom_id
      AND classrooms.teacher_id = (select auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Students can view assignments in their classrooms" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_members.classroom_id = assignments.classroom_id
      AND classroom_members.student_id = (select auth.jwt() ->> 'sub')
    )
  );

-- Assignment Submissions Policies
CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN classrooms ON classrooms.id = assignments.classroom_id
      WHERE assignments.id = assignment_submissions.assignment_id
      AND classrooms.teacher_id = (select auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Students can view and update their own submissions" ON assignment_submissions
  FOR ALL USING (student_id = (select auth.jwt() ->> 'sub'));

-- Classroom Members Policies
CREATE POLICY "Teachers can view students in their classrooms" ON classroom_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = classroom_members.classroom_id
      AND classrooms.teacher_id = (select auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Students can view their own memberships" ON classroom_members
  FOR SELECT USING (student_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Students can join classrooms" ON classroom_members
  FOR INSERT WITH CHECK (student_id = (select auth.jwt() ->> 'sub'));
