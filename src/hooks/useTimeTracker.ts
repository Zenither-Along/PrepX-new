import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

export function useTimeTracker() {
  const { user } = useUser();
  const supabase = useSupabase();
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  const updateProfileTotalTime = async (minutes: number) => {
    if (!user || minutes === 0) return;

    try {
      // RPC call would be better for atomicity, but for now we fetch-then-update
      // or use a raw SQL query if possible. Since we don't have an RPC for this yet,
      // we'll fetch the current value first.
      
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_minutes_learned')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Silently ignore if profile not found - user might not have a profile yet
        if (fetchError.code === 'PGRST116') return;
        console.warn('Failed to fetch profile for time update:', fetchError.message);
        return;
      }

      const newTotal = (profile?.total_minutes_learned || 0) + minutes;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_minutes_learned: newTotal })
        .eq('user_id', user.id);

      if (updateError) {
        console.warn('Failed to update total time:', updateError.message);
      }
      
    } catch (err: unknown) {
      // Silently handle unexpected errors - time tracking is non-critical
      if (process.env.NODE_ENV === 'development') {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn('Time tracking error:', message);
      }
    }
  };

  const saveToDailyHistory = async (minutes: number) => {
    if (!user || minutes === 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert: if record exists, add to minutes, otherwise create new
      const { data: existing } = await supabase
        .from('user_activity_log')
        .select('minutes_learned')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const newMinutes = (existing?.minutes_learned || 0) + minutes;

      await supabase
        .from('user_activity_log')
        .upsert({
          user_id: user.id,
          date: today,
          minutes_learned: newMinutes,
          was_active: true
        }, {
          onConflict: 'user_id,date'
        });
    } catch (err) {
      console.error('Error saving to activity history:', err instanceof Error ? err.message : String(err), err);
    }
  };

  useEffect(() => {
    // Reset start time on mount
    startTimeRef.current = Date.now();
    accumulatedTimeRef.current = 0;

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - accumulate time
        const elapsed = Date.now() - startTimeRef.current;
        accumulatedTimeRef.current += elapsed;
        isVisibleRef.current = false;
      } else {
        // Page visible again - reset start time
        startTimeRef.current = Date.now();
        isVisibleRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Save time every 60 seconds
    const interval = setInterval(async () => {
      if (!isVisibleRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const totalElapsed = accumulatedTimeRef.current + elapsed;
      const minutes = Math.floor(totalElapsed / 60000);

      if (minutes > 0) {
        await updateProfileTotalTime(minutes);
        await saveToDailyHistory(minutes);
        // Reset tracking
        accumulatedTimeRef.current = 0;
        startTimeRef.current = Date.now();
      }
    }, 60000); // Check every 60 seconds

    // Save remaining time on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      const elapsed = isVisibleRef.current 
        ? Date.now() - startTimeRef.current 
        : 0;
      const totalElapsed = accumulatedTimeRef.current + elapsed;
      const minutes = Math.floor(totalElapsed / 60000);

      if (minutes > 0) {
        updateProfileTotalTime(minutes);
        saveToDailyHistory(minutes); // Don't await in cleanup
      }
    };
  }, [user]); // Only depend on user, not addLearningTime
}
