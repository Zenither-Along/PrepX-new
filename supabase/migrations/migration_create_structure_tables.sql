-- Branches
create table if not exists branches (
  id uuid default gen_random_uuid() primary key,
  path_id uuid references learning_paths(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0
);

-- Branch Items (Sub-topics)
create table if not exists branch_items (
  id uuid default gen_random_uuid() primary key,
  branch_id uuid references branches(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0
);

-- Content Sections
create table if not exists content_sections (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references branch_items(id) on delete cascade not null,
  type text not null, -- 'heading', 'paragraph', etc.
  content jsonb not null, -- Stores the actual data
  order_index integer not null default 0
);

-- Enable RLS
alter table branches enable row level security;
alter table branch_items enable row level security;
alter table content_sections enable row level security;

-- Policies (simplified for immediate access)
create policy "Users can view branches of their paths" on branches
  for select using (true); -- We rely on path_id filtering in query usually, or strict RLS

create policy "Users can insert branches" on branches
  for insert with check (true);

create policy "Users can view items" on branch_items
  for select using (true);

create policy "Users can insert items" on branch_items
  for insert with check (true);

create policy "Users can view content" on content_sections
  for select using (true);

create policy "Users can insert content" on content_sections
  for insert with check (true);
