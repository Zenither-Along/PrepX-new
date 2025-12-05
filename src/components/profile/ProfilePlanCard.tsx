'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ExternalLink } from 'lucide-react';
import { USAGE_LIMITS } from '@/hooks/useAIUsage';

export function ProfilePlanCard() {
  const limits = Object.values(USAGE_LIMITS);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            Current Plan
          </CardTitle>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Free
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          You&apos;re currently on the Free plan with generous monthly limits.
        </div>
        
        {/* Usage limits summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {limits.map((limit) => (
            <div key={limit.label} className="flex items-center gap-1.5 text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>{limit.limit} {limit.label.toLowerCase()}{limit.isDaily ? '/day' : '/mo'}</span>
            </div>
          ))}
        </div>

        <Link href="/pricing" className="block">
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
