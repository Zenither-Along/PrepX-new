import { createSupabaseClient } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

import { auth } from "@clerk/nextjs/server";

export async function getPublicPaths(query?: string, tag?: string) {
  noStore();
  const { userId } = await auth();
  const supabase = createSupabaseClient();

  let dbQuery = supabase
    .from("learning_paths")
    .select("*")
    .eq("is_public", true)
    .order("likes", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  if (tag) {
    dbQuery = dbQuery.contains("tags", [tag]);
  }

  const { data: paths, error } = await dbQuery;

  if (error) {
    console.error("Error fetching public paths:", error);
    throw new Error("Failed to fetch public paths");
  }

  // If user is logged in, check which paths they liked
  // if (userId && paths.length > 0) {
  //   const { data: userLikes } = await supabase
  //     .from("path_likes")
  //     .select("path_id")
  //     .eq("user_id", userId)
  //     .in("path_id", paths.map(p => p.id));

  //   const likedPathIds = new Set(userLikes?.map(l => l.path_id) || []);

  //   return paths.map(path => ({
  //     ...path,
  //     is_liked: likedPathIds.has(path.id)
  //   }));
  // }

  return paths; // .map(path => ({ ...path, is_liked: false }));
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
