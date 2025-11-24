-- Function to safely update likes count bypassing RLS
create or replace function update_path_likes(path_id uuid, adjustment int)
returns void
language plpgsql
security definer
as $$
begin
  update learning_paths
  set likes = coalesce(likes, 0) + adjustment
  where id = path_id;
end;
$$;
