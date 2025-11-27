import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher';
  created_at: string;
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

  return {
    profile,
    loading,
    error,
    createProfile,
    updateRole,
    refreshProfile: fetchProfile
  };
}
