-- Learning Paths
create table learning_paths (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Clerk User ID
  title text not null,
  subtitle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Branches
create table branches (
  id uuid default gen_random_uuid() primary key,
  path_id uuid references learning_paths(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0
);

-- Branch Items (Sub-topics)
create table branch_items (
  id uuid default gen_random_uuid() primary key,
  branch_id uuid references branches(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0
);

-- Content Sections
create table content_sections (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references branch_items(id) on delete cascade not null,
  type text not null, -- 'heading', 'paragraph', etc.
  content jsonb not null, -- Stores the actual data
  order_index integer not null default 0
);

-- RLS Policies
alter table learning_paths enable row level security;
alter table branches enable row level security;
alter table branch_items enable row level security;
alter table content_sections enable row level security;

create policy "Users can view their own paths" on learning_paths
  for select using (auth.uid()::text = user_id);

create policy "Users can insert their own paths" on learning_paths
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update their own paths" on learning_paths
  for update using (auth.uid()::text = user_id);

create policy "Users can delete their own paths" on learning_paths
  for delete using (auth.uid()::text = user_id);

-- Policies for child tables (simplified: if you can access the path, you can access the children)
-- Ideally, we should check the path ownership, but for simplicity we can assume if you have the ID you can access it, 
-- OR we can do a join. For now, let's keep it simple and rely on the application logic + basic RLS.
-- A better approach for child tables:
create policy "Users can view branches of their paths" on branches
  for select using (
    exists (
      select 1 from learning_paths
      where learning_paths.id = branches.path_id
      and learning_paths.user_id = auth.uid()::text
    )
  );

create policy "Users can insert branches to their paths" on branches
  for insert with check (
    exists (
      select 1 from learning_paths
      where learning_paths.id = branches.path_id
      and learning_paths.user_id = auth.uid()::text
    )
  );

create policy "Users can update branches of their paths" on branches
  for update using (
    exists (
      select 1 from learning_paths
      where learning_paths.id = branches.path_id
      and learning_paths.user_id = auth.uid()::text
    )
  );

create policy "Users can delete branches of their paths" on branches
  for delete using (
    exists (
      select 1 from learning_paths
      where learning_paths.id = branches.path_id
      and learning_paths.user_id = auth.uid()::text
    )
  );

-- Repeat similar logic for branch_items and content_sections if strict RLS is needed.
