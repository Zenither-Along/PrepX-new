-- Create assignment section progress table
CREATE TABLE IF NOT EXISTS assignment_section_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(assignment_id, student_id, column_id)
);

-- Enable RLS
ALTER TABLE assignment_section_progress ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
CREATE POLICY "Students can view own section progress"
  ON assignment_section_progress FOR SELECT
  USING (student_id = auth.uid()::text);

-- Students can insert/update their own progress
CREATE POLICY "Students can update own section progress"
  ON assignment_section_progress FOR ALL
  USING (student_id = auth.uid()::text);

-- Teachers can view their students' progress
CREATE POLICY "Teachers can view student progress"
  ON assignment_section_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.id = assignment_section_progress.assignment_id
      AND a.created_by = auth.uid()::text
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_progress_assignment ON assignment_section_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_section_progress_student ON assignment_section_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_section_progress_column ON assignment_section_progress(column_id);
