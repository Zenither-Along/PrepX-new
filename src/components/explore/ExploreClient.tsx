"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { clonePath } from "@/lib/actions/actions";
import { useRouter } from "next/navigation";
import { PathCardSkeleton } from "./PathCardSkeleton";

interface Path {
  id: string;
  title: string;
  subtitle: string | null;
  tags: string[] | null;
  clones: number;
  user_id: string;
  likes: number;
}

interface ExploreClientProps {
  initialPaths: Path[];
  initialTotal: number;
  initialHasMore: boolean;
  userId: string | null;
  searchQuery?: string;
  tagFilter?: string;
}

export function ExploreClient({
  initialPaths,
  initialTotal,
  initialHasMore,
  userId,
  searchQuery = "",
  tagFilter = "",
}: ExploreClientProps) {
  const [paths, setPaths] = useState<Path[]>(initialPaths);
  const [page, setPage] = useState(1); // Start at 1 since initial data is page 0
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openSignIn } = useClerk();

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (searchQuery) params.append("q", searchQuery);
      if (tagFilter) params.append("tag", tagFilter);

      const response = await fetch(`/api/explore/paths?${params}`);
      const data = await response.json();

      if (data.paths && data.paths.length > 0) {
        setPaths((prev) => [...prev, ...data.paths]);
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more paths:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, searchQuery, tagFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  async function handleClone(pathId: string) {
    if (!userId) return;

    try {
      await clonePath(pathId);
      router.push("/");
    } catch (error) {
      console.error("Clone failed:", error);
    }
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paths.map((path) => (
          <Card
            key={path.id}
            className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="line-clamp-1 text-lg">
                  {path.title}
                </CardTitle>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground min-h-[40px]">
                {path.subtitle || "No description provided."}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {path.tags?.slice(0, 3).map((t: string) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardFooter className="mt-auto flex items-center justify-between border-t bg-muted/20 px-6 py-3">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  <span>{path.clones || 0}</span>
                </div>
              </div>

              {/* Show clone button based on auth status */}
              {!userId ? (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="gap-2"
                  onClick={() => openSignIn()}
                  suppressHydrationWarning
                >
                  <Copy className="h-3.5 w-3.5" />
                  Clone (Sign in)
                </Button>
              ) : userId !== path.user_id ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => handleClone(path.id)}
                  suppressHydrationWarning
                >
                  <Copy className="h-3.5 w-3.5" />
                  Clone
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div ref={observerTarget} className="w-full py-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PathCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {/* End of results */}
      {!hasMore && paths.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end! 🎉</p>
        </div>
      )}

      {/* No results */}
      {paths.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold">No paths found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </>
  );
}
