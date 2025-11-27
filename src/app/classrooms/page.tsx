"use client";

import { useProfile } from "@/hooks/useProfile";
import { useClassrooms } from "@/hooks/useClassrooms";
import { TeacherClassroomList } from "@/components/classrooms/TeacherClassroomList";
import { StudentClassroomList } from "@/components/classrooms/StudentClassroomList";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ClassroomsPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { classrooms, loading: classroomsLoading, createClassroom, joinClassroom } = useClassrooms();

  if (profileLoading || classroomsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">Please complete your profile setup first.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Logo width={140} height={48} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">
              {profile.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-12">
        {profile.role === 'teacher' ? (
          <TeacherClassroomList 
            classrooms={classrooms} 
            onCreateClass={createClassroom} 
          />
        ) : (
          <StudentClassroomList 
            classrooms={classrooms} 
            onJoinClass={joinClassroom} 
          />
        )}
      </main>
    </div>
  );
}
