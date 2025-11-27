import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';
import { useProfile } from './useProfile';

export interface Assignment {
  id: string;
  classroom_id: string;
  path_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  created_by: string;
  // Joined data
  classroom_name?: string;
  path_title?: string;
  submission_status?: 'not_started' | 'in_progress' | 'completed';
  progress_percentage?: number;
}

export function useAssignments(classroomId?: string) {
  const { user } = useUser();
  const supabase = useSupabase();
  const { profile } = useProfile();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchAssignments();
    }
  }, [profile, classroomId]);

  const fetchAssignments = async () => {
    if (!profile || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      if (profile.role === 'teacher') {
        // Fetch assignments created by this teacher
        let query = supabase
          .from('assignments')
          .select(`
            *,
            classrooms:classroom_id (name),
            learning_paths:path_id (title)
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (classroomId) {
          query = query.eq('classroom_id', classroomId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase error fetching assignments:', error);
          throw error;
        }

        const transformed = data.map((a: any) => ({
          ...a,
          classroom_name: a.classrooms?.name,
          path_title: a.learning_paths?.title
        }));

        setAssignments(transformed);
      } else {
        // Fetch assignments for student with submission status
        let query = supabase
          .from('assignments')
          .select(`
            *,
            classrooms:classroom_id (name),
            learning_paths:path_id (title),
            assignment_submissions!left (status, progress_percentage)
          `)
          .order('due_date', { ascending: true, nullsFirst: false });

        if (classroomId) {
          query = query.eq('classroom_id', classroomId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase error fetching assignments:', error);
          throw error;
        }

        const transformed = data.map((a: any) => {
          const submission = a.assignment_submissions?.find(
            (s: any) => s.student_id === user.id
          );
          return {
            ...a,
            classroom_name: a.classrooms?.name,
            path_title: a.learning_paths?.title,
            submission_status: submission?.status || 'not_started',
            progress_percentage: submission?.progress_percentage || 0
          };
        });

        setAssignments(transformed);
      }
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (
    classroomId: string,
    pathId: string,
    title: string,
    description: string,
    dueDate: Date | null
  ) => {
    if (!user || profile?.role !== 'teacher') return null;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          classroom_id: classroomId,
          path_id: pathId,
          title,
          description,
          due_date: dueDate?.toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating assignment:', error);
        throw new Error(error.message || 'Failed to create assignment');
      }

      await fetchAssignments();
      return data;
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      throw err;
    }
  };

  const updateSubmissionStatus = async (
    assignmentId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage: number
  ) => {
    if (!user || profile?.role !== 'student') return;

    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.id,
          status,
          progress_percentage: progressPercentage,
          submitted_at: status === 'completed' ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error updating submission:', error);
        throw error;
      }

      await fetchAssignments();
    } catch (err: any) {
      console.error('Error updating submission:', err);
      throw err;
    }
  };

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateSubmissionStatus,
    refreshAssignments: fetchAssignments
  };
}
