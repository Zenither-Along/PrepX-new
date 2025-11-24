-- Create table to track user likes
create table path_likes (
  user_id text not null,
  path_id uuid references learning_paths(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, path_id)
);

-- Enable RLS
alter table path_likes enable row level security;

create policy "Users can view all likes" on path_likes
  for select using (true);

create policy "Users can insert their own likes" on path_likes
  for insert with check (auth.uid()::text = user_id);

create policy "Users can delete their own likes" on path_likes
  for delete using (auth.uid()::text = user_id);
