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
      // 1. Fetch Assignments Base Data
      let query = supabase
        .from('assignments')
        .select('*');

      if (profile.role === 'teacher') {
        query = query.eq('created_by', user.id).order('created_at', { ascending: false });
      } else {
        query = query.order('due_date', { ascending: true, nullsFirst: false });
      }

      if (classroomId) {
        query = query.eq('classroom_id', classroomId);
      }

      const { data: assignmentsData, error: assignmentsError } = await query;

      if (assignmentsError) {
        console.error('Supabase error fetching assignments:', assignmentsError);
        throw new Error(assignmentsError.message);
      }

      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        return;
      }

      // 2. Collect IDs for related data
      const classroomIds = [...new Set(assignmentsData.map((a: any) => a.classroom_id))];
      const pathIds = [...new Set(assignmentsData.map((a: any) => a.path_id))];
      const assignmentIds = assignmentsData.map((a: any) => a.id);

      // 3. Fetch Related Data in Parallel
      // 3. Fetch Related Data
      // We fetch these separately to avoid TypeScript union type issues with Promise.all on mixed query builders
      const classroomsPromise = supabase.from('classrooms').select('id, name').in('id', classroomIds);
      const pathsPromise = supabase.from('learning_paths').select('id, title').in('id', pathIds);
      
      let submissionsPromise: any = Promise.resolve({ data: [], error: null });
      
      if (profile.role === 'student') {
        submissionsPromise = supabase.from('assignment_submissions')
            .select('assignment_id, status, progress_percentage')
            .eq('student_id', user.id)
            .in('assignment_id', assignmentIds);
      }

      const [classroomsRes, pathsRes, submissionsRes] = await Promise.all([
        classroomsPromise, 
        pathsPromise, 
        submissionsPromise
      ]);

      if (classroomsRes.error) console.error('Error fetching classrooms:', classroomsRes.error);
      if (pathsRes.error) console.error('Error fetching paths:', pathsRes.error);
      if (submissionsRes && submissionsRes.error) console.error('Error fetching submissions:', submissionsRes.error);

      const classroomsMap = new Map(classroomsRes.data?.map((c: any) => [c.id, c.name]));
      const pathsMap = new Map(pathsRes.data?.map((p: any) => [p.id, p.title]));
      const submissionsMap = new Map(submissionsRes?.data?.map((s: any) => [s.assignment_id, s]));

      // 4. Merge Data
      const transformed = assignmentsData.map((a: any) => {
        const submission: any = submissionsMap.get(a.id);
        return {
          ...a,
          classroom_name: classroomsMap.get(a.classroom_id) || 'Unknown Classroom',
          path_title: pathsMap.get(a.path_id) || 'Unknown Path',
          submission_status: submission?.status || 'not_started',
          progress_percentage: submission?.progress_percentage || 0
        };
      });

      setAssignments(transformed);

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
      // Count total content columns in the path
      const { data: contentColumns, error: countError } = await supabase
        .from('columns')
        .select('id', { count: 'exact' })
        .eq('path_id', pathId)
        .eq('type', 'content');
      
      if (countError) {
        console.error('Error counting content columns:', countError);
      }
      
      const totalSections = contentColumns?.length || 0;
      console.log(`Creating assignment with ${totalSections} total sections`);
      
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          classroom_id: classroomId,
          path_id: pathId,
          title,
          description,
          due_date: dueDate?.toISOString(),
          created_by: user.id,
          total_sections: totalSections
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
        }, {
          onConflict: 'assignment_id,student_id'
        });

      if (error) {
        console.error('Supabase error updating submission:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      await fetchAssignments();
    } catch (err: any) {
      console.error('Error updating submission:', err);
      console.error('Error message:', err?.message);
      console.error('Error details:', err?.details);
      console.error('Error hint:', err?.hint);
      console.error('Error code:', err?.code);
      throw err;
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!user || profile?.role !== 'teacher') return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        console.error('Supabase error deleting assignment:', error);
        throw error;
      }

      await fetchAssignments();
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      throw err;
    }
  };

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateSubmissionStatus,
    deleteAssignment,
    refreshAssignments: fetchAssignments
  };

}
