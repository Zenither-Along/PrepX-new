"use client";

import { Classroom } from "@/hooks/useClassrooms";
import { CreateClassDialog } from "./CreateClassDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Copy, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeacherClassroomListProps {
  classrooms: Classroom[];
  onCreateClass: (name: string, description: string, color: string) => Promise<any>;
}

export function TeacherClassroomList({ classrooms, onCreateClass }: TeacherClassroomListProps) {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add toast here
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      red: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Classrooms</h2>
          <p className="text-muted-foreground">Manage your classes and students</p>
        </div>
        <CreateClassDialog onCreate={onCreateClass} />
      </div>

      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No classes yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            Create your first class to start assigning learning paths to your students.
          </p>
          <CreateClassDialog onCreate={onCreateClass} />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
              <div className={`h-2 ${getColorClass(classroom.color).split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`} />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{classroom.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Archive Class</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {classroom.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Code</div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-lg tracking-widest">{classroom.code}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(classroom.code)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 pt-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{classroom.student_count} Students</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href={`/classrooms/${classroom.id}`}>
                      Manage <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
