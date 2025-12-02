import { useEffect } from 'react';
import { useProfile } from './useProfile';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

const ACTIVITY_CHECK_KEY = 'prepx_activity_checked_today';

export function useActivityTracker() {
  const { profile, updateStreak } = useProfile();
  const { user } = useUser();
  const supabase = useSupabase();

  useEffect(() => {
    if (!profile || !user) return;

    // Check if we've already updated activity today based on profile data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = profile.last_active_date ? new Date(profile.last_active_date) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      if (lastActive.getTime() === today.getTime()) {
        return; // Already marked active in DB today
      }
    }

    checkAndUpdateStreak();
    markTodayAsActive();
  }, [profile, user]);

  const markTodayAsActive = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('user_activity_log')
        .upsert({
          user_id: user.id,
          date: today,
          was_active: true,
          minutes_learned: 0
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });
    } catch (err) {
      console.error('Error marking today as active:', err);
    }
  };

  const checkAndUpdateStreak = async () => {
    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!profile.last_active_date) {
      // First time user is active
      await updateStreak(1, today.toISOString());
      return;
    }

    const lastActive = new Date(profile.last_active_date);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today, no update needed
      return;
    } else if (diffDays === 1) {
      // Consecutive day - increment streak
      await updateStreak(profile.streak_days + 1, today.toISOString());
    } else {
      // Streak broken - reset to 1
      await updateStreak(1, today.toISOString());
    }
  };
}
