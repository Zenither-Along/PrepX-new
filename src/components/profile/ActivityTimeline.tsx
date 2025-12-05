"use client";

import { RecentActivity } from '@/hooks/useProfileStats';
import { BookOpen, FileText, Trophy, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  activities: RecentActivity[];
  loading?: boolean;
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'path_created':
        return BookOpen;
      case 'assignment_created':
        return FileText;
      case 'assignment_submitted':
        return CheckCircle;
      case 'quiz_taken':
        return Trophy;
      default:
        return BookOpen;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'path_created':
        return 'text-blue-500';
      case 'assignment_created':
        return 'text-green-500';
      case 'assignment_submitted':
        return 'text-purple-500';
      case 'quiz_taken':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActivityLabel = (type: RecentActivity['type']) => {
    switch (type) {
      case 'path_created':
        return 'Created path';
      case 'assignment_created':
        return 'Created assignment';
      case 'assignment_submitted':
        return 'Submitted assignment';
      case 'quiz_taken':
        return 'Completed quiz';
      default:
        return 'Activity';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet.</p>
            <p className="text-sm mt-2">Start creating paths or taking assignments!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const label = getActivityLabel(activity.type);

              return (
                <div key={activity.id} className="flex items-start gap-4 group">
                  <div className={`p-2 rounded-full bg-muted group-hover:bg-accent transition-colors ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {label} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
