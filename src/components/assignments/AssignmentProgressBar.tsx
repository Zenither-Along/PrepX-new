"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AssignmentProgressBarProps {
  assignmentTitle: string;
  currentProgress: number;
  completedSections: number;
  totalSections: number;
  status: 'not_started' | 'in_progress' | 'completed';
  onComplete: () => void;
  isCompleting?: boolean;
}

export function AssignmentProgressBar({
  assignmentTitle,
  currentProgress,
  completedSections,
  totalSections,
  status,
  onComplete,
  isCompleting = false
}: AssignmentProgressBarProps) {
  const isCompleted = status === 'completed';
  
  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto p-4 shadow-lg border-2 bg-background/95 backdrop-blur z-50">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-full">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{assignmentTitle}</p>
              <p className="text-xs text-muted-foreground">
                {isCompleted 
                  ? `All ${totalSections} sections completed` 
                  : `${completedSections} of ${totalSections} sections completed`
                }
              </p>
            </div>
            <span className="text-sm font-semibold">{currentProgress}%</span>
          </div>
          
          <Progress value={currentProgress} className="h-2" />
        </div>
        
        {!isCompleted && (
          <Button 
            onClick={onComplete}
            disabled={isCompleting || currentProgress === 100}
            className="gap-2"
            size="sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleting ? 'Completing...' : 'Complete'}
          </Button>
        )}
        
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>
    </Card>
  );
}
