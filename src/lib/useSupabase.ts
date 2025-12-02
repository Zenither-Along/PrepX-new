import { useSupabase as useSupabaseContext } from "@/components/providers/supabase-provider";

export function useSupabase() {
  return useSupabaseContext();
}
