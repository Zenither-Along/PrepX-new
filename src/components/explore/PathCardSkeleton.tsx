import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PathCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
        <div className="mt-2 flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      
      <CardFooter className="mt-auto flex items-center justify-between border-t bg-muted/20 px-6 py-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}
