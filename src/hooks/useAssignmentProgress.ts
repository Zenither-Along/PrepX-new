import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';

interface SectionProgress {
  column_id: string;
  completed: boolean;
  completed_at: string | null;
}

export function useAssignmentProgress(assignmentId: string | null) {
  const { user } = useUser();
  const supabase = useSupabase();
  
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId && user) {
      fetchSectionProgress();
    } else {
      setCompletedSections(new Set());
      setLoading(false);
    }
  }, [assignmentId, user]);

  const fetchSectionProgress = async () => {
    if (!assignmentId || !user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignment_section_progress')
        .select('column_id, completed, completed_at')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .eq('completed', true);

      if (error) throw error;

      const completed = new Set(data?.map((s: SectionProgress) => s.column_id) || []);
      setCompletedSections(completed);
    } catch (err: any) {
      console.error('Error fetching section progress:', err);
      console.error('Error message:', err?.message);
      console.error('Error details:', err?.details);
      console.error('Error hint:', err?.hint);
      console.error('Error code:', err?.code);
      console.error('Full error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionComplete = async (columnId: string, isCompleted: boolean) => {
    if (!assignmentId || !user) return;

    try {
      const { error } = await supabase
        .from('assignment_section_progress')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.id,
          column_id: columnId,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'assignment_id,student_id,column_id'
        });

      if (error) throw error;

      // Update local state
      setCompletedSections(prev => {
        const next = new Set(prev);
        if (isCompleted) {
          next.add(columnId);
        } else {
          next.delete(columnId);
        }
        return next;
      });
    } catch (err: any) {
      console.error('Error toggling section completion:', err);
      console.error('Error message:', err?.message);
      console.error('Error details:', err?.details);
      console.error('Error hint:', err?.hint);
      console.error('Error code:', err?.code);
      throw err;
    }
  };

  return {
    completedSections,
    loading,
    toggleSectionComplete,
    refreshProgress: fetchSectionProgress
  };
}
