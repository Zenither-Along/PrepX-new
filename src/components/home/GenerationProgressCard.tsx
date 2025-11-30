'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';

interface GenerationProgressCardProps {
  title: string;
  progress: number;
  message: string;
  status: 'generating' | 'ready' | 'error';
}

export function GenerationProgressCard({ title, progress, message, status }: GenerationProgressCardProps) {
  return (
    <Card className="h-full flex flex-col justify-between border-dashed border-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {title || 'Processing PDF...'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'generating' ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{message}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating in background...
            </div>
          </>
        ) : status === 'ready' ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-600" />
            Ready! Refreshing...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {message || 'Generation failed'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
