import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

export function useSupabase() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const token = await getToken({ template: "supabase" });
            
            if (!token) {
                console.warn("useSupabase: No token received from Clerk. Check if 'supabase' JWT template is configured.");
            } else {
                // console.log("useSupabase: Token received");
            }

            const headers = new Headers(options?.headers);
            
            if (token) {
              headers.set("Authorization", `Bearer ${token}`);
            }
            
            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );
  }, [getToken]);

  return supabase;
}
