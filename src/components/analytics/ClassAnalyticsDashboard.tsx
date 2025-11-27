"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressChart } from "./ProgressChart";
import { StudentProgressCard } from "./StudentProgressCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2, Users, BookOpen, CheckCircle2 } from "lucide-react";

interface ClassAnalyticsDashboardProps {
  classroomId: string;
}

export function ClassAnalyticsDashboard({ classroomId }: ClassAnalyticsDashboardProps) {
  const { studentProgress, assignmentStats, loading } = useAnalytics(classroomId);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const averageCompletion = studentProgress.length > 0
    ? Math.round(studentProgress.reduce((acc, curr) => acc + curr.completion_percentage, 0) / studentProgress.length)
    : 0;

  const totalAssignments = assignmentStats.length;
  const totalStudents = studentProgress.length;

  const chartData = assignmentStats.map(stat => ({
    name: stat.title.length > 15 ? stat.title.substring(0, 15) + '...' : stat.title,
    value: stat.completion_rate
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletion}%</div>
            <p className="text-xs text-muted-foreground">Class-wide average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Assignment Completion Rates</CardTitle>
            <CardDescription>Percentage of students who completed each assignment</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
            <CardDescription>Individual student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {studentProgress.map((student) => (
                <StudentProgressCard key={student.student_id} student={student} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
