-- Drop policies if they exist to avoid errors
DROP POLICY IF EXISTS "Teachers can manage assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view and update their own submissions" ON assignment_submissions;

-- Drop tables if they exist to ensure clean slate (WARNING: This deletes data in these tables)
-- Only run these DROP commands if you don't have important data in assignments/submissions yet
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;

-- Assignments Table
CREATE TABLE assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  created_by text NOT NULL, -- Teacher's User ID (matches code)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assignment Submissions Table
CREATE TABLE assignment_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id text NOT NULL, -- Student's User ID (matches code)
  status text CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  submitted_at timestamp with time zone,
  last_accessed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Assignments
CREATE POLICY "Teachers can manage assignments in their classrooms" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = assignments.classroom_id
      AND classrooms.teacher_id = auth.uid()::text -- Corrected to teacher_id
    )
  );

CREATE POLICY "Students can view assignments in their classrooms" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_members.classroom_id = assignments.classroom_id
      AND classroom_members.student_id = auth.uid()::text -- Verified student_id column
    )
  );

-- RLS Policies for Assignment Submissions
CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN classrooms ON classrooms.id = assignments.classroom_id
      WHERE assignments.id = assignment_submissions.assignment_id
      AND classrooms.teacher_id = auth.uid()::text -- Corrected to teacher_id
    )
  );

CREATE POLICY "Students can view and update their own submissions" ON assignment_submissions
  FOR ALL USING (student_id = auth.uid()::text);
