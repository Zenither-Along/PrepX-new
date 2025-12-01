-- =======================================================
-- FIX PERFORMANCE: Optimize Auth RLS Policies
-- =======================================================
-- Fixes 33 performance warnings by wrapping auth functions
--  with (select ...) to prevent re-evaluation per row

-- ====================
-- PATH_LIKES
-- ====================

DROP POLICY IF EXISTS "Users can insert their own likes" ON path_likes;
CREATE POLICY "Users can insert their own likes" ON path_likes
  FOR INSERT
  WITH CHECK (user_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Users can delete their own likes" ON path_likes;
CREATE POLICY "Users can delete their own likes" ON path_likes
  FOR DELETE
  USING (user_id = (SELECT requesting_user_id()));

-- ====================
-- CHAT_MESSAGES
-- ====================

DROP POLICY IF EXISTS "Users can view their chat messages" ON chat_messages;
CREATE POLICY "Users can view their chat messages" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = chat_messages.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Users can insert their chat messages" ON chat_messages;
CREATE POLICY "Users can insert their chat messages" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Users can delete their chat messages" ON chat_messages;
CREATE POLICY "Users can delete their chat messages" ON chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = chat_messages.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- ASSIGNMENTS
-- ====================

DROP POLICY IF EXISTS "Teachers can manage assignments in their classrooms" ON assignments;
CREATE POLICY "Teachers can manage assignments in their classrooms" ON assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = assignments.classroom_id
      AND classrooms.teacher_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Students can view assignments in their classrooms" ON assignments;
CREATE POLICY "Students can view assignments in their classrooms" ON assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_members.classroom_id = assignments.classroom_id
      AND classroom_members.student_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- ASSIGNMENT_SUBMISSIONS
-- ====================

DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classrooms c ON c.id = a.classroom_id
      WHERE a.id = assignment_submissions.assignment_id
      AND c.teacher_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Students can view and update their own submissions" ON assignment_submissions;
CREATE POLICY "Students can view and update their own submissions" ON assignment_submissions
  FOR ALL
  USING (student_id = (SELECT requesting_user_id()));

-- ====================
-- CLASSROOM_MEMBERS
-- ====================

DROP POLICY IF EXISTS "Teachers can view students in their classrooms" ON classroom_members;
CREATE POLICY "Teachers can view students in their classrooms" ON classroom_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = classroom_members.classroom_id
      AND classrooms.teacher_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Students can view their own memberships" ON classroom_members;
CREATE POLICY "Students can view their own memberships" ON classroom_members
  FOR SELECT
  USING (student_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_members;
CREATE POLICY "Students can join classrooms" ON classroom_members
  FOR INSERT
  WITH CHECK (student_id = (SELECT requesting_user_id()));

-- ====================
-- LEARNING_PATHS
-- ====================

DROP POLICY IF EXISTS "Authenticated users full access to own paths" ON learning_paths;
CREATE POLICY "Authenticated users full access to own paths" ON learning_paths
  FOR ALL
  USING (user_id = (SELECT requesting_user_id()));

-- ====================
-- COLUMNS
-- ====================

DROP POLICY IF EXISTS "Authenticated users full access to own columns" ON columns;
CREATE POLICY "Authenticated users full access to own columns" ON columns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = columns.path_id
      AND learning_paths.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- COLUMN_ITEMS
-- ====================

DROP POLICY IF EXISTS "Authenticated users full access to own items" ON column_items;
CREATE POLICY "Authenticated users full access to own items" ON column_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = column_items.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- CONTENT_SECTIONS
-- ====================

DROP POLICY IF EXISTS "Authenticated users full access to own sections" ON content_sections;
CREATE POLICY "Authenticated users full access to own sections" ON content_sections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = content_sections.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- QUIZZES
-- ====================

DROP POLICY IF EXISTS "Authenticated users full access to own quizzes" ON quizzes;
CREATE POLICY "Authenticated users full access to own quizzes" ON quizzes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = quizzes.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- QUIZ_QUESTIONS
-- ====================

DROP POLICY IF EXISTS "Authenticated users full access to own questions" ON quiz_questions;
CREATE POLICY "Authenticated users full access to own questions" ON quiz_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN columns c ON c.id = q.column_id
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE q.id = quiz_questions.quiz_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- QUIZ_ATTEMPTS
-- ====================

DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
CREATE POLICY "Users can view own attempts" ON quiz_attempts
  FOR SELECT
  USING (user_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Users can insert own attempts" ON quiz_attempts;
CREATE POLICY "Users can insert own attempts" ON quiz_attempts
  FOR INSERT
  WITH CHECK (user_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Path owners can view attempts on their quizzes" ON quiz_attempts;
CREATE POLICY "Path owners can view attempts on their quizzes" ON quiz_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN columns c ON c.id = q.column_id
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE q.id = quiz_attempts.quiz_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- PROFILES
-- ====================

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (user_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (user_id = (SELECT requesting_user_id()));

-- ====================
-- CHAT_SESSIONS
-- ====================

DROP POLICY IF EXISTS "Users can view their chat sessions" ON chat_sessions;
CREATE POLICY "Users can view their chat sessions" ON chat_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = chat_sessions.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Users can insert their chat sessions" ON chat_sessions;
CREATE POLICY "Users can insert their chat sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

DROP POLICY IF EXISTS "Users can delete their chat sessions" ON chat_sessions;
CREATE POLICY "Users can delete their chat sessions" ON chat_sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN learning_paths lp ON lp.id = c.path_id
      WHERE c.id = chat_sessions.column_id
      AND lp.user_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- ASSIGNMENT_SECTION_PROGRESS
-- ====================

DROP POLICY IF EXISTS "Students can view own section progress" ON assignment_section_progress;
CREATE POLICY "Students can view own section progress" ON assignment_section_progress
  FOR SELECT
  USING (student_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Students can update own section progress" ON assignment_section_progress;
CREATE POLICY "Students can update own section progress" ON assignment_section_progress
  FOR ALL
  USING (student_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Teachers can view student progress" ON assignment_section_progress;
CREATE POLICY "Teachers can view student progress" ON assignment_section_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classrooms c ON c.id = a.classroom_id
      WHERE a.id = assignment_section_progress.assignment_id
      AND c.teacher_id = (SELECT requesting_user_id())
    )
  );

-- ====================
-- CLASSROOMS
-- ====================

DROP POLICY IF EXISTS "Teachers can view their own classrooms" ON classrooms;
CREATE POLICY "Teachers can view their own classrooms" ON classrooms
  FOR SELECT
  USING (teacher_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Teachers can insert their own classrooms" ON classrooms;
CREATE POLICY "Teachers can insert their own classrooms" ON classrooms
  FOR INSERT
  WITH CHECK (teacher_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Teachers can update their own classrooms" ON classrooms;
CREATE POLICY "Teachers can update their own classrooms" ON classrooms
  FOR UPDATE
  USING (teacher_id = (SELECT requesting_user_id()));

DROP POLICY IF EXISTS "Teachers can delete their own classrooms" ON classrooms;
CREATE POLICY "Teachers can delete their own classrooms" ON classrooms
  FOR DELETE
  USING (teacher_id = (SELECT requesting_user_id()));

-- Classrooms code lookup policy already uses code equality, already optimized
