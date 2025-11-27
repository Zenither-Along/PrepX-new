-- NUCLEAR OPTION: Reset all analytics-related tables to ensure correct types
-- WARNING: This will delete data in assignments, submissions, and classroom memberships.
-- Classrooms and Learning Paths are PRESERVED.

-- 1. Drop tables in dependency order
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS classroom_members;

-- 2. Recreate classroom_members with TEXT student_id
CREATE TABLE classroom_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id text NOT NULL, -- Explicitly TEXT to store Clerk IDs
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(classroom_id, student_id)
);

-- 3. Recreate assignments with TEXT created_by
CREATE TABLE assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  created_by text NOT NULL, -- Explicitly TEXT to store Clerk IDs
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Recreate assignment_submissions with TEXT student_id
CREATE TABLE assignment_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id text NOT NULL, -- Explicitly TEXT to store Clerk IDs
  status text CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  submitted_at timestamp with time zone,
  last_accessed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- 5. Enable RLS
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- 6. Re-apply RLS Policies

-- Classroom Members Policies
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

-- Assignments Policies
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

-- Assignment Submissions Policies
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
