"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAssignments } from "@/hooks/useAssignments";
import { useSupabase } from "@/lib/useSupabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateAssignmentDialog } from "@/components/assignments/CreateAssignmentDialog";
import { ArrowLeft, Users, BookOpen, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassAnalyticsDashboard } from "@/components/analytics/ClassAnalyticsDashboard";

export default function ClassroomDetailPage() {
  const params = useParams();
  const classroomId = params.id as string;
  
  const { profile, loading: profileLoading } = useProfile();
  const { assignments, loading: assignmentsLoading, createAssignment } = useAssignments(classroomId);
  const supabase = useSupabase();
  
  const [classroom, setClassroom] = useState<any>(null);
  const [loadingClassroom, setLoadingClassroom] = useState(true);

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
    }
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', classroomId)
        .single();

      if (error) throw error;
      setClassroom(data);
    } catch (error) {
      console.error('Error fetching classroom:', error);
    } finally {
      setLoadingClassroom(false);
    }
  };

  const handleCreateAssignment = async (
    pathId: string,
    title: string,
    description: string,
    dueDate: Date | null
  ) => {
    await createAssignment(classroomId, pathId, title, description, dueDate);
  };

  if (profileLoading || loadingClassroom) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-12">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-12 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Classroom Not Found</h1>
        <Button asChild>
          <Link href="/classrooms">Back to Classrooms</Link>
        </Button>
      </div>
    );
  }

  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-4">
            <Link href="/classrooms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Logo width={140} height={48} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-12">
        {/* Classroom Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{classroom.name}</h1>
              {classroom.description && (
                <p className="mt-2 text-muted-foreground max-w-2xl">{classroom.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                  <Users className="h-4 w-4" />
                  <span>Class Code: <code className="font-mono font-bold text-primary">{classroom.code}</code></span>
                </div>
              </div>
            </div>
            {isTeacher && (
              <CreateAssignmentDialog 
                classroomId={classroomId}
                onCreate={handleCreateAssignment}
              />
            )}
          </div>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="assignments" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Assignments
              </TabsTrigger>
              {isTeacher && (
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="assignments" className="space-y-4 animate-in fade-in-50 duration-500">
            {assignmentsLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">No assignments yet</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    {isTeacher 
                      ? 'Create your first assignment to get started. Students will see it here.'
                      : 'Your teacher hasn\'t assigned any work yet. Check back later!'}
                  </p>
                  {isTeacher && (
                    <div className="mt-6">
                      <CreateAssignmentDialog 
                        classroomId={classroomId}
                        onCreate={handleCreateAssignment}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment, index) => (
                  <div 
                    key={assignment.id} 
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AssignmentCard 
                      assignment={assignment} 
                      role={profile?.role || 'student'} 
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {isTeacher && (
            <TabsContent value="analytics" className="animate-in fade-in-50 duration-500">
              <ClassAnalyticsDashboard classroomId={classroomId} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
