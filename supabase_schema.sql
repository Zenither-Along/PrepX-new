-- ==========================================
-- PREPX DATABASE SCHEMA
-- ==========================================
-- Generated: 2024-11-30
-- This is the complete, accurate schema for PrepX

-- ==========================================
-- USER & PROFILE MANAGEMENT
-- ==========================================

CREATE TABLE profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL UNIQUE, -- Clerk User ID
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- LEARNING PATHS & STRUCTURE
-- ==========================================

CREATE TABLE learning_paths (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL, -- Clerk User ID
  title text NOT NULL,
  subtitle text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_major boolean DEFAULT false,
  is_public boolean DEFAULT false,
  tags text[] DEFAULT '{}'::text[],
  likes integer DEFAULT 0,
  clones integer DEFAULT 0,
  author_name text,
  original_path_id uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
  status text DEFAULT 'ready'::text, -- 'generating', 'ready', 'error'
  generation_progress integer DEFAULT 0,
  generation_step text
);

-- NEW COLUMN-BASED STRUCTURE (Active)
CREATE TABLE columns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  parent_item_id uuid REFERENCES column_items(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'branch'::text -- 'branch', 'content'
);

CREATE TABLE column_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id uuid NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  parent_item_id uuid REFERENCES column_items(id) ON DELETE CASCADE
);

CREATE TABLE content_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id uuid NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'heading', 'subheading', 'paragraph', 'image', 'video', 
    'link', 'list', 'code', 'qna', 'table', 'rich-text', 'callout'
  )),
  content jsonb NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

-- OLD BRANCH STRUCTURE (Deprecated - can be removed)
CREATE TABLE branches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

CREATE TABLE branch_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

-- ==========================================
-- COMMUNITY FEATURES
-- ==========================================

CREATE TABLE path_likes (
  user_id text NOT NULL,
  path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, path_id)
);

-- ==========================================
-- AI CHAT
-- ==========================================

CREATE TABLE chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id uuid REFERENCES columns(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id uuid REFERENCES columns(id) ON DELETE CASCADE,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'user', 'assistant'
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- CLASSROOMS & ASSIGNMENTS
-- ==========================================

CREATE TABLE classrooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id text NOT NULL, -- Clerk User ID
  name text NOT NULL,
  description text,
  code text NOT NULL UNIQUE,
  color text DEFAULT 'blue'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE classroom_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id text NOT NULL, -- Clerk User ID
  joined_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(classroom_id, student_id)
);

CREATE TABLE assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  created_by text NOT NULL, -- Clerk User ID
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  total_sections integer DEFAULT 0
);

CREATE TABLE assignment_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id text NOT NULL, -- Clerk User ID
  status text DEFAULT 'not_started'::text, -- 'not_started', 'in_progress', 'submitted'
  progress_percentage integer DEFAULT 0,
  submitted_at timestamp with time zone,
  last_accessed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE assignment_section_progress (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id text NOT NULL, -- Clerk User ID
  column_id uuid NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- QUIZZES (Missing tables - need to create)
-- ==========================================

CREATE TABLE quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id uuid NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE quiz_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
  options text[], -- For multiple choice
  correct_answer text NOT NULL,
  explanation text,
  order_index integer NOT NULL DEFAULT 0
);

CREATE TABLE quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Clerk User ID
  score integer NOT NULL,
  total_questions integer NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_is_public ON learning_paths(is_public) WHERE is_public = true;
CREATE INDEX idx_columns_path_id ON columns(path_id);
CREATE INDEX idx_column_items_column_id ON column_items(column_id);
CREATE INDEX idx_content_sections_column_id ON content_sections(column_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_classroom_members_classroom_id ON classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student_id ON classroom_members(student_id);
CREATE INDEX idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be in separate migration files for security
-- See migration files for detailed policies
