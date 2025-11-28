import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';
import { useProfile } from './useProfile';

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  code: string;
  color: string;
  created_at: string;
  student_count?: number;
  teacher_name?: string;
}

export function useClassrooms() {
  const { user } = useUser();
  const supabase = useSupabase();
  const { profile } = useProfile();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchClassrooms();
    }
  }, [profile]);

  const fetchClassrooms = async () => {
    if (!profile || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      if (profile.role === 'teacher') {
        // Fetch classrooms created by this teacher
        const { data, error } = await supabase
          .from('classrooms')
          .select('*, classroom_members(count)')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error fetching classrooms:', error);
          throw error;
        }

        // Transform data to include student count
        const transformed = data.map((c: any) => ({
          ...c,
          student_count: c.classroom_members?.[0]?.count || 0
        }));

        setClassrooms(transformed);
      } else {
        // Fetch classrooms joined by this student
        const { data, error } = await supabase
          .from('classroom_members')
          .select(`
            classroom_id,
            classrooms:classrooms (*)
          `)
          .eq('student_id', user.id)
          .order('joined_at', { ascending: false });

        if (error) throw error;

        // Transform to return just the classroom objects
        const joinedClassrooms = data.map((item: any) => item.classrooms);
        
        // Fetch teacher profiles for these classrooms
        const teacherIds = joinedClassrooms.map((c: any) => c.teacher_id).filter(Boolean);
        
        if (teacherIds.length > 0) {
          const { data: teacherProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', teacherIds);
          
          if (!profileError && teacherProfiles) {
            // Merge teacher names into classrooms
            const classroomsWithTeachers = joinedClassrooms.map((classroom: any) => {
              const teacher = teacherProfiles.find((p: any) => p.user_id === classroom.teacher_id);
              return {
                ...classroom,
                teacher_name: teacher?.full_name || 'Unknown Instructor'
              };
            });
            setClassrooms(classroomsWithTeachers);
          } else {
            setClassrooms(joinedClassrooms);
          }
        } else {
          setClassrooms(joinedClassrooms);
        }
      }
    } catch (err: any) {
      console.error('Error fetching classrooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (name: string, description: string, color: string = 'blue') => {
    if (!user || profile?.role !== 'teacher') return null;

    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          teacher_id: user.id,
          name,
          description,
          code,
          color
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating classroom:', error);
        throw new Error(error.message || 'Failed to create classroom');
      }

      setClassrooms([data, ...classrooms]);
      return data;
    } catch (err: any) {
      console.error('Error creating classroom:', err);
      throw err;
    }
  };

  const joinClassroom = async (code: string) => {
    if (!user || profile?.role !== 'student') return null;

    try {
      // First find the classroom by code
      const { data: classroom, error: findError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('code', code)
        .single();

      if (findError || !classroom) {
        throw new Error('Invalid class code');
      }

      // Check if already joined
      const { data: existing } = await supabase
        .from('classroom_members')
        .select('id')
        .eq('classroom_id', classroom.id)
        .eq('student_id', user.id)
        .single();

      if (existing) {
        throw new Error('You have already joined this class');
      }

      // Join the class
      const { error: joinError } = await supabase
        .from('classroom_members')
        .insert({
          classroom_id: classroom.id,
          student_id: user.id
        });

      if (joinError) throw joinError;

      // Refresh list
      await fetchClassrooms();
      return true;
    } catch (err: any) {
      console.error('Error joining classroom:', err);
      throw err;
    }
  };

  return {
    classrooms,
    loading,
    error,
    createClassroom,
    joinClassroom,
    refreshClassrooms: fetchClassrooms
  };
}
