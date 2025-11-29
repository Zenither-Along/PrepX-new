"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/useSupabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export function useChatHistory(columnId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  // Load chat history when component mounts or columnId changes
  useEffect(() => {
    async function loadHistory() {
      if (!columnId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Loading chat history for columnId:", columnId);

        // Auto-cleanup: Delete messages older than 10 days (non-blocking)
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        
        supabase
          .from("chat_messages")
          .delete()
          .eq("column_id", columnId)
          .lt("created_at", tenDaysAgo.toISOString())
          .then(({ error: cleanupError }) => {
            if (cleanupError) {
              console.warn("Cleanup of old messages failed:", cleanupError);
            } else {
              console.log("Cleaned up messages older than 10 days");
            }
          });


        const { data, error: fetchError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("column_id", columnId)
          .order("created_at", { ascending: true });

        if (fetchError) {
          console.error("Supabase error details:", {
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
            code: fetchError.code
          });
          
          // If it's a permission error, just log it but don't show error to user
          // This is expected for first-time use before any messages are saved
          if (fetchError.code === 'PGRST301' || fetchError.message.includes('permission')) {
            console.warn("No chat history access - this is normal for first use");
            setMessages([]);
          } else {
            setError(fetchError.message);
            setMessages([]);
          }
        } else {
          console.log("Loaded chat history:", data?.length || 0, "messages");
          setMessages(data || []);
        }
      } catch (err: any) {
        console.error("Exception loading chat history:", {
          message: err.message,
          stack: err.stack,
          error: err
        });
        setError(err.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [columnId, supabase]);

  // Save a single message to the database
  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!columnId) {
      console.warn("Cannot save message: no columnId provided");
      return null;
    }

    try {
      console.log("Saving message:", { columnId, role, contentLength: content.length });
      
      const { data, error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          column_id: columnId,
          role,
          content,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error saving message - Supabase error details:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw insertError;
      }

      console.log("Message saved successfully:", data?.id);
      return data;
    } catch (err: any) {
      console.error("Error in saveMessage:", {
        message: err.message,
        error: err
      });
      throw err;
    }
  };

  // Clear all chat history for this column
  const clearHistory = async () => {
    if (!columnId) {
      console.warn("Cannot clear history: no columnId provided");
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("chat_messages")
        .delete()
        .eq("column_id", columnId);

      if (deleteError) {
        console.error("Error clearing chat history:", deleteError);
        throw deleteError;
      }

      setMessages([]);
    } catch (err: any) {
      console.error("Error in clearHistory:", err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    saveMessage,
    clearHistory,
  };
}
