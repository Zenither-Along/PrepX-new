import { useState, useEffect, useCallback } from "react";
import { useAssignments } from "@/hooks/useAssignments";
import { useAssignmentProgress } from "@/hooks/useAssignmentProgress";
import { useProfile } from "@/hooks/useProfile";
import { db } from "@/lib/db";
import { Column } from "../edit/types";

export function useAssignmentLogic(pathId: string, columns: Column[]) {
  const { assignments, updateSubmissionStatus } = useAssignments();
  const { profile } = useProfile();
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Section progress tracking
  const { completedSections, toggleSectionComplete } = useAssignmentProgress(
    currentAssignment?.id || null
  );

  // Track assignment progress
  useEffect(() => {
    if (pathId && profile?.role === 'student' && assignments.length > 0) {
      const assignment = assignments.find(a => a.path_id === pathId);
      
      if (assignment && assignment.submission_status === 'not_started') {
        updateSubmissionStatus(assignment.id, 'in_progress', 0)
          .catch(err => console.error('Failed to update status:', err));
      }
    }
  }, [pathId, profile, assignments, updateSubmissionStatus]);

  // Track current assignment
  useEffect(() => {
    if (pathId && profile?.role === 'student' && assignments.length > 0) {
      const assignment = assignments.find(a => a.path_id === pathId);
      setCurrentAssignment(assignment || null);
    } else {
      setCurrentAssignment(null);
    }
  }, [pathId, profile, assignments]);

  // Self-healing: Fix missing total_sections count
  useEffect(() => {
    const fixMissingSectionCount = async () => {
      if (currentAssignment && (currentAssignment.total_sections === 0 || !currentAssignment.total_sections)) {
        try {
          // Count content columns
          const { count, error } = await db
            .from('columns')
            .select('*', { count: 'exact', head: true })
            .eq('path_id', currentAssignment.path_id)
            .eq('type', 'content');
          
          if (error) throw error;
          
          const actualCount = count || 0;
          
          if (actualCount > 0) {
            // Update assignment in DB
            const { error: updateError } = await db
              .from('assignments')
              .update({ total_sections: actualCount })
              .eq('id', currentAssignment.id);
              
            if (updateError) throw updateError;
            
            // Update local state to reflect change immediately
            setCurrentAssignment((prev: any) => ({
              ...prev,
              total_sections: actualCount
            }));
          }
        } catch (err) {
          console.error('[Self-Healing] Failed to fix section count:', err);
        }
      }
    };
    
    fixMissingSectionCount();
  }, [currentAssignment?.id, currentAssignment?.total_sections, currentAssignment?.path_id]);

  // Fetch total quiz count for progress calculation
  useEffect(() => {
    const fetchTotalQuizzes = async () => {
      try {
        if (columns.length === 0) return;
        const columnIds = columns.map(c => c.id);
        const { data, error } = await db
          .from('quizzes')
          .select('id', { count: 'exact' })
          .in('column_id', columnIds);
        
        if (error) throw error;
        setTotalQuizzes(data?.length || 0);
      } catch (err) {
        console.error('Error fetching quiz count:', err);
      }
    };

    if (currentAssignment) {
      fetchTotalQuizzes();
    }
  }, [currentAssignment, columns]);

  const handleCompleteAssignment = async () => {
    if (!currentAssignment) return;
    
    // Show confirmation dialog
    const confirmed = confirm(
      'Are you sure you want to mark this assignment as complete? This action will finalize your submission.'
    );
    
    if (!confirmed) return;
    
    setIsCompleting(true);
    try {
      const finalProgress = 100;
      await updateSubmissionStatus(currentAssignment.id, 'completed', finalProgress);
    } catch (err) {
      console.error('Error completing assignment:', err);
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleToggleSection = async (columnId: string, isCompleted: boolean) => {
    try {
      await toggleSectionComplete(columnId, isCompleted);
      
      // Wait for state to update, then calculate and update progress
      if (currentAssignment) {
        // Use total_sections from assignment
        const totalSections = currentAssignment.total_sections || 0;
        
        if (totalSections > 0) {
          // Create updated set
          const updatedCompleted = new Set(completedSections);
          if (isCompleted) {
            updatedCompleted.add(columnId);
          } else {
            updatedCompleted.delete(columnId);
          }
          
          // Calculate progress (80% max from sections)
          const sectionProgress = (updatedCompleted.size / totalSections) * 80;
          const newProgress = Math.floor(sectionProgress);
          
          await updateSubmissionStatus(
            currentAssignment.id,
            newProgress === 100 ? 'completed' : 'in_progress',
            newProgress
          );
        }
      }
    } catch (err) {
      console.error('Error updating section:', err);
    }
  };

  const calculateProgress = useCallback(() => {
    if (!currentAssignment) return 0;
    if (currentAssignment.status === 'completed') return 100;
    
    const totalSections = currentAssignment.total_sections || 0;
    if (totalSections === 0) return 0;
    
    const safeTotal = totalSections || 1;
    const sectionProgress = (completedSections.size / safeTotal) * 80;
    
    return Math.floor(sectionProgress);
  }, [currentAssignment, completedSections]);

  return {
    currentAssignment,
    completedSections,
    handleCompleteAssignment,
    handleToggleSection,
    isCompleting,
    profile,
    progress: calculateProgress()
  };
}
