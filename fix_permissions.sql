-- Disable RLS for development purposes (since we haven't set up Clerk-Supabase JWT integration)
alter table learning_paths disable row level security;
alter table branches disable row level security;
alter table branch_items disable row level security;
alter table content_sections disable row level security;
