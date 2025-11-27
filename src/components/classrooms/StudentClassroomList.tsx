"use client";

import { Classroom } from "@/hooks/useClassrooms";
import { JoinClassDialog } from "./JoinClassDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, ExternalLink, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StudentClassroomListProps {
  classrooms: Classroom[];
  onJoinClass: (code: string) => Promise<any>;
}

export function StudentClassroomList({ classrooms, onJoinClass }: StudentClassroomListProps) {
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
          <h2 className="text-2xl font-bold tracking-tight">My Classes</h2>
          <p className="text-muted-foreground">Classes you have joined</p>
        </div>
        <JoinClassDialog onJoin={onJoinClass} />
      </div>

      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <School className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No classes joined</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            Join your first class to access assignments and learning materials.
          </p>
          <JoinClassDialog onJoin={onJoinClass} />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom, index) => (
            <Card 
              key={classroom.id} 
              className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 ${getColorClass(classroom.color).split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`} />
              <CardHeader className="pb-4">
                <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">{classroom.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {classroom.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                  <User className="h-4 w-4" />
                  <span>Instructor</span>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 pt-4">
                <Button variant="ghost" size="sm" className="w-full gap-1 group/btn" asChild>
                  <Link href={`/classrooms/${classroom.id}`}>
                    Go to Class 
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
