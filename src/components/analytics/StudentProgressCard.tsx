"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StudentProgress } from "@/hooks/useAnalytics";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentProgressCardProps {
  student: StudentProgress;
}

export function StudentProgressCard({ student }: StudentProgressCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{student.student_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <CardTitle className="text-sm font-medium leading-none truncate">
            {student.student_name}
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate">{student.student_email}</p>
        </div>
        <div className="ml-auto font-bold">
          {student.completion_percentage}%
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={student.completion_percentage} className="h-2" />
        <div className="mt-2 text-xs text-muted-foreground">
          {student.completed_assignments} of {student.total_assignments} assignments completed
        </div>
      </CardContent>
    </Card>
  );
}
