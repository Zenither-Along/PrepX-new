import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

export interface DayActivity {
  date: string;
  minutes: number;
  wasActive: boolean;
}

export function useActivityHistory() {
  const { user } = useUser();
  const supabase = useSupabase();
  const [weekData, setWeekData] = useState<DayActivity[]>([]);
  const [monthData, setMonthData] = useState<DayActivity[]>([]);
  const [yearData, setYearData] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchWeekData(),
      fetchMonthData(),
      fetchYearData()
    ]);
    setLoading(false);
  };

  const fetchWeekData = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('date, minutes_learned, was_active')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      console.log('🔍 Week data fetch - user.id:', user.id);
      console.log('🔍 Week data fetch - data:', data);
      console.log('🔍 Week data fetch - error:', error);

      if (error) {
        console.error('Supabase error fetching week data:', error);
        throw error;
      }

      // Fill in missing days with 0
      const filledData: DayActivity[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(sevenDaysAgo.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existing = data?.find(d => d.date === dateStr);
        filledData.push({
          date: dateStr,
          minutes: existing?.minutes_learned || 0,
          wasActive: existing?.was_active || false
        });
      }

      setWeekData(filledData);
    } catch (err: any) {
      console.error('Error fetching week data:', err?.message || err);
    }
  };

  const fetchMonthData = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('date, minutes_learned, was_active')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Supabase error fetching month data:', error);
        throw error;
      }

      // Fill in missing days
      const filledData: DayActivity[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existing = data?.find(d => d.date === dateStr);
        filledData.push({
          date: dateStr,
          minutes: existing?.minutes_learned || 0,
          wasActive: existing?.was_active || false
        });
      }

      setMonthData(filledData);
    } catch (err: any) {
      console.error('Error fetching month data:', err?.message || err);
    }
  };

  const fetchYearData = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('date, minutes_learned, was_active')
        .eq('user_id', user.id)
        .gte('date', oneYearAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Supabase error fetching year data:', error);
        throw error;
      }

      setYearData(data?.map(d => ({
        date: d.date,
        minutes: d.minutes_learned || 0,
        wasActive: d.was_active || false
      })) || []);
    } catch (err: any) {
      console.error('Error fetching year data:', err?.message || err);
    }
  };

  return {
    weekData,
    monthData,
    yearData,
    loading,
    refresh: fetchAllData
  };
}
