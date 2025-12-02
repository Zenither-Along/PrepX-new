"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const token = await getToken({ template: "supabase" });
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
    )
  );

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context!;
}
