import { createSupabaseClient } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

import { auth } from "@clerk/nextjs/server";

export async function getPublicPaths(
  query?: string, 
  tag?: string,
  page: number = 0,
  limit: number = 12
) {
  noStore();
  const { userId } = await auth();
  const supabase = createSupabaseClient();
  const offset = page * limit;

  // Optimize: Single query for both count and data, selecting only needed columns
  let dbQuery = supabase
    .from("learning_paths")
    .select(
      "id, title, subtitle, tags, clones, user_id, likes, created_at, is_public", 
      { count: "exact" }
    )
    .eq("is_public", true)
    .order("likes", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  if (tag) {
    dbQuery = dbQuery.contains("tags", [tag]);
  }

  const { data: paths, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching public paths:", error);
    throw new Error("Failed to fetch public paths");
  }

  return {
    paths: paths || [],
    total: count || 0,
    hasMore: (offset + limit) < (count || 0)
  };
}

export async function getPathById(id: string) {
  noStore();
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }
  
  return data;
}
