"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAssignments } from "@/hooks/useAssignments";
import { useSupabase } from "@/lib/useSupabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateAssignmentDialog } from "@/components/assignments/CreateAssignmentDialog";
import { ArrowLeft, Calendar, Users, BookOpen, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Logo } from "@/components/logo";

export default function ClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      not_started: { variant: "outline", icon: Circle, label: "Not Started" },
      in_progress: { variant: "secondary", icon: Clock, label: "In Progress" },
      completed: { variant: "default", icon: CheckCircle2, label: "Completed" }
    };
    
    const config = variants[status] || variants.not_started;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (profileLoading || loadingClassroom) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{classroom.name}</h1>
              {classroom.description && (
                <p className="mt-2 text-muted-foreground">{classroom.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Class Code: <code className="font-mono font-bold">{classroom.code}</code></span>
                </div>
              </div>
            </div>
            {profile?.role === 'teacher' && (
              <CreateAssignmentDialog 
                classroomId={classroomId}
                onCreate={handleCreateAssignment}
              />
            )}
          </div>
        </div>

        {/* Assignments Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Assignments</h2>
          
          {assignmentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No assignments yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {profile?.role === 'teacher' 
                    ? 'Create your first assignment to get started.'
                    : 'Your teacher hasn\'t assigned any work yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {assignment.path_title}
                        </CardDescription>
                      </div>
                      {profile?.role === 'student' && assignment.submission_status && (
                        getStatusBadge(assignment.submission_status)
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {assignment.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due {format(new Date(assignment.due_date), 'PPP')}</span>
                          </div>
                        )}
                      </div>
                      <Button asChild>
                        <Link href={`/path/${assignment.path_id}`}>
                          {profile?.role === 'student' ? 'Start Assignment' : 'View Path'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
