"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/lib/useSupabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  session_id?: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChatHistory(columnId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  // Load sessions when component mounts or columnId changes
  useEffect(() => {
    if (!columnId) {
      setLoading(false);
      return;
    }

    loadSessions();
  }, [columnId, supabase]);

  // Load messages when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    loadMessages(currentSessionId);
  }, [currentSessionId, supabase]);

  const loadSessions = async () => {
    if (!columnId) return;

    try {
      setLoading(true);
      
      // Auto-cleanup: Delete sessions older than 10 days (non-blocking)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      supabase
        .from("chat_sessions")
        .delete()
        .eq("column_id", columnId)
        .lt("updated_at", tenDaysAgo.toISOString())
        .then(({ error: cleanupError }) => {
          if (cleanupError) console.warn("Session cleanup failed:", cleanupError);
        });

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("column_id", columnId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setSessions(data || []);
      
      // If we have sessions but no current one selected, select the most recent one
      if (data && data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      } else if (!data || data.length === 0) {
        // No sessions exist, create one automatically
        createSession();
      }
    } catch (err: any) {
      console.error("Error loading sessions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message);
    }
  };

  const createSession = async () => {
    if (!columnId) return;

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          column_id: columnId,
          title: "New Conversation",
        })
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      setCurrentSessionId(data.id);
      setMessages([]);
      return data;
    } catch (err: any) {
      console.error("Error creating session:", err);
      setError(err.message);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setMessages([]);
        setCurrentSessionId(null);
        // If there are other sessions, switch to the next one, otherwise create new
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          createSession();
        }
      }
    } catch (err: any) {
      console.error("Error deleting session:", err);
      setError(err.message);
    }
  };

  // Save a single message to the database
  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!columnId || !currentSessionId) {
      console.warn("Cannot save message: no columnId or session provided");
      return null;
    }

    try {
      // Update session updated_at timestamp
      supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentSessionId)
        .then(() => {});

      const { data, error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          column_id: columnId,
          session_id: currentSessionId,
          role,
          content,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err: any) {
      console.error("Error in saveMessage:", err);
      throw err;
    }
  };

  // Clear all chat history for this column (Legacy support, now deletes current session)
  const clearHistory = async () => {
    if (currentSessionId) {
      await deleteSession(currentSessionId);
    }
  };

  return {
    messages,
    sessions,
    currentSessionId,
    loading,
    error,
    saveMessage,
    clearHistory,
    createSession,
    deleteSession,
    setCurrentSessionId
  };
}
