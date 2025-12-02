import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

export interface UserStats {
  paths_created: number;
  paths_viewed: number;
  classrooms_joined: number;
  assignments_created: number;
  assignments_submitted: number;
  quizzes_taken: number;
}

export interface RecentActivity {
  id: string;
  type: 'path_created' | 'assignment_created' | 'assignment_submitted' | 'quiz_taken';
  title: string;
  created_at: string;
}

export function useProfileStats() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabase();
  
  const [stats, setStats] = useState<UserStats>({
    paths_created: 0,
    paths_viewed: 0,
    classrooms_joined: 0,
    assignments_created: 0,
    assignments_submitted: 0,
    quizzes_taken: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    fetchStats();
    fetchRecentActivity();
  }, [user, isLoaded]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch paths created
      const { count: pathsCreated } = await supabase
        .from('learning_paths')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch classrooms joined (members)
      const { count: classroomsJoined } = await supabase
        .from('classroom_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch assignments created
      const { count: assignmentsCreated } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Fetch assignments submitted
      const { count: assignmentsSubmitted } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      // Fetch quizzes taken (we'll use a simple count from a potential quiz_attempts table)
      // For now, we can count quizzes from the quizzes table
      const { count: quizzesTaken } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      setStats({
        paths_created: pathsCreated || 0,
        paths_viewed: 0, // Can be tracked separately if needed
        classrooms_joined: classroomsJoined || 0,
        assignments_created: assignmentsCreated || 0,
        assignments_submitted: assignmentsSubmitted || 0,
        quizzes_taken: quizzesTaken || 0,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Fetch recent paths
      const { data: recentPaths } = await supabase
        .from('learning_paths')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      // Add recent paths
      if (recentPaths) {
        activities.push(
          ...recentPaths.map((path) => ({
            id: path.id,
            type: 'path_created' as const,
            title: path.title,
            created_at: path.created_at,
          }))
        );
      }

      // Sort by date and limit
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentActivity(activities.slice(0, 10));
    } catch (err: any) {
      console.error('Error fetching recent activity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshStats: fetchStats,
    refreshActivity: fetchRecentActivity,
  };
}
