import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/useSupabase';

export interface StudentProgress {
  student_id: string;
  student_name: string;
  student_email: string;
  completed_assignments: number;
  total_assignments: number;
  completion_percentage: number;
  last_active: string;
}

export interface AssignmentStats {
  assignment_id: string;
  title: string;
  completed_count: number;
  total_students: number;
  completion_rate: number;
  avg_score?: number; // If we had scores
}

export function useAnalytics(classroomId: string) {
  const supabase = useSupabase();
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classroomId) {
      fetchAnalytics();
    }
  }, [classroomId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log('Fetching analytics for classroom:', classroomId);

      // Fetch all students in the class (manual join to avoid relationship issues)
      const { data: members, error: membersError } = await supabase
        .from('classroom_members')
        .select('student_id')
        .eq('classroom_id', classroomId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw new Error(`Failed to fetch members: ${membersError.message}`);
      }
      
      const studentIds = members?.map((m: any) => m.student_id) || [];
      console.log('Fetched member IDs:', studentIds.length);

      // Fetch profiles for these students
      let students: any[] = [];
      if (studentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', studentIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }
        
        // Merge data
        students = members!.map((m: any) => {
          const profile = profiles?.find((p: any) => p.user_id === m.student_id);
          return {
            student_id: m.student_id,
            profiles: profile ? { full_name: profile.full_name, email: profile.email } : { full_name: 'Unknown', email: '' }
          };
        });
      }
      console.log('Merged students:', students.length);

      // Fetch all assignments in the class
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id, title')
        .eq('classroom_id', classroomId);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw new Error(`Failed to fetch assignments: ${assignmentsError.message}`);
      }
      console.log('Fetched assignments:', assignments?.length);

      // Fetch all submissions
      let submissions: any[] = [];
      if (assignments && assignments.length > 0) {
        const { data: subs, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select('*')
          .in('assignment_id', assignments.map(a => a.id));

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
          throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
        }
        submissions = subs || [];
      }
      console.log('Fetched submissions:', submissions?.length);

      // Calculate Student Progress
      const progressData = (students || []).map((s: any) => {
        const studentSubmissions = submissions.filter(sub => sub.student_id === s.student_id);
        const completed = studentSubmissions.filter(sub => sub.status === 'completed').length;
        const total = assignments?.length || 0;
        
        // Calculate average progress across all assignments
        const totalProgress = studentSubmissions.reduce((acc, sub) => acc + (sub.progress_percentage || 0), 0);
        // If student hasn't started an assignment, it counts as 0
        // We divide by total assignments to get the overall class completion
        const overallCompletion = total > 0 ? Math.round(totalProgress / total) : 0;

        // Find last active date
        const lastActive = studentSubmissions
          .map(sub => new Date(sub.last_accessed_at).getTime())
          .sort((a, b) => b - a)[0];

        return {
          student_id: s.student_id,
          student_name: s.profiles?.full_name || 'Unknown',
          student_email: s.profiles?.email || '',
          completed_assignments: completed,
          total_assignments: total,
          completion_percentage: overallCompletion,
          last_active: lastActive ? new Date(lastActive).toISOString() : new Date().toISOString()
        };
      });

      setStudentProgress(progressData);

      // Calculate Assignment Stats
      const statsData = (assignments || []).map((a: any) => {
        const assignmentSubmissions = submissions.filter(sub => sub.assignment_id === a.id);
        const completed = assignmentSubmissions.filter(sub => sub.status === 'completed').length;
        const totalStudents = students?.length || 0;
        
        // Calculate average progress for this assignment across all students
        const totalProgress = assignmentSubmissions.reduce((acc, sub) => acc + (sub.progress_percentage || 0), 0);
        const avgProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

        return {
          assignment_id: a.id,
          title: a.title,
          completed_count: completed,
          total_students: totalStudents,
          completion_rate: avgProgress // Using average progress instead of just completion rate
        };
      });

      setAssignmentStats(statsData);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      console.error('Error stack:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  return {
    studentProgress,
    assignmentStats,
    loading,
    refreshAnalytics: fetchAnalytics
  };
}
