"use client";

import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Circle, Clock, ArrowRight, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  path_id: string;
  path_title?: string;
  submission_status?: 'not_started' | 'in_progress' | 'completed';
  progress_percentage?: number;
}

interface AssignmentCardProps {
  assignment: Assignment;
  role: 'teacher' | 'student';
  onDelete?: (id: string) => Promise<void>;
}

export function AssignmentCard({ assignment, role, onDelete }: AssignmentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = confirm("Are you sure you want to delete this assignment? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(assignment.id);
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      setIsDeleting(false);
    }
  };
  const getStatusConfig = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
      not_started: { variant: "outline", icon: Circle, label: "Not Started", color: "text-muted-foreground" },
      in_progress: { variant: "secondary", icon: Clock, label: "In Progress", color: "text-blue-500" },
      completed: { variant: "default", icon: CheckCircle2, label: "Completed", color: "text-green-500" }
    };
    
    return variants[status] || variants.not_started;
  };

  const statusConfig = assignment.submission_status ? getStatusConfig(assignment.submission_status) : null;
  const StatusIcon = statusConfig?.icon;

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.submission_status !== 'completed';

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      {/* Status Stripe */}
      {role === 'student' && assignment.submission_status && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-colors",
          assignment.submission_status === 'completed' ? "bg-green-500" :
          assignment.submission_status === 'in_progress' ? "bg-blue-500" :
          "bg-muted"
        )} />
      )}

      <CardHeader className="pb-3 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                {assignment.title}
              </CardTitle>
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">Overdue</Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <BookOpen className="h-3.5 w-3.5" />
              {assignment.path_title}
            </CardDescription>
          </div>
          
          {role === 'student' && statusConfig && (
            <Badge variant={statusConfig.variant} className="gap-1.5 shrink-0">
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          )}

          {role === 'teacher' && onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pl-6">
        {assignment.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {assignment.description}
          </p>
        )}

        <div className="space-y-4">
          {role === 'student' && assignment.submission_status !== 'not_started' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{assignment.progress_percentage || 0}%</span>
              </div>
              <Progress value={assignment.progress_percentage || 0} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {assignment.due_date && (
                <div className={cn(
                  "flex items-center gap-1.5",
                  isOverdue ? "text-destructive font-medium" : ""
                )}>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isOverdue ? "Due " : "Due "} 
                    {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>

            <Button asChild size="sm" className="gap-2 group-hover:translate-x-1 transition-transform">
              <Link href={`/path/${assignment.path_id}`}>
                {role === 'student' ? (
                  assignment.submission_status === 'not_started' ? 'Start' : 'Continue'
                ) : 'View Path'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
