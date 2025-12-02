import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher';
  bio: string | null;
  avatar_url: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  streak_days: number;
  total_minutes_learned: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string | null;
}

export function useProfile() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useSupabase();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoaded || !user) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user, isUserLoaded]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // No profile exists yet
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (role: 'student' | 'teacher') => {
    if (!user) return null;

    try {
      setLoading(true);
      const newProfile = {
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        full_name: user.fullName,
        role,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (role: 'student' | 'teacher') => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBio = async (bio: string) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error('Error updating bio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatar_url: string) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error('Error updating avatar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateThemePreference = async (theme_preference: 'light' | 'dark' | 'system') => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ theme_preference })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error('Error updating theme preference:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateName = async (full_name: string) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error('Error updating name:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async (streak_days: number, last_active_date: string) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ streak_days, last_active_date })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error updating streak:', err);
    }
  };

  const addLearningTime = async (minutes: number) => {
    if (!user || !profile) return;

    try {
      const newTotal = profile.total_minutes_learned + minutes;
      const { data, error } = await supabase
        .from('profiles')
        .update({ total_minutes_learned: newTotal })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error updating learning time:', err);
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateRole,
    updateBio,
    updateAvatar,
    updateName,
    updateThemePreference,
    updateStreak,
    addLearningTime,
    refreshProfile: fetchProfile
  };
}

