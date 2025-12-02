import { getPublicPaths } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Logo } from "@/components/logo";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { userId } = await auth();
  const { q, tag } = await searchParams;
  const query = q || "";
  const tagFilter = tag || "";
  
  // Fetch initial page of paths (page 0, 12 items)
  const { paths, total, hasMore } = await getPublicPaths(query, tagFilter, 0, 12);

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Logo width={140} height={48} />
          </div>
          <div className="hidden md:flex items-center gap-4 w-1/3">
            <form className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search paths..."
                className="pl-9 w-full bg-muted/50"
                defaultValue={query}
              />
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 md:px-12 py-6 md:py-12">
        {/* Mobile Search Bar */}
        <div className="mb-6 md:hidden">
            <form className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search paths..."
                className="pl-9 w-full bg-muted/50"
                defaultValue={query}
              />
            </form>
        </div>

        {/* Tags Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {["React", "Next.js", "Python", "Design", "Interview"].map((t) => (
            <Link key={t} href={`/explore?tag=${t}`}>
              <Badge variant={tagFilter === t ? "default" : "outline"} className="cursor-pointer px-4 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground whitespace-nowrap">
                {t}
              </Badge>
            </Link>
          ))}
          {tagFilter && (
            <Button variant="ghost" size="sm" className="h-8 whitespace-nowrap" asChild>
              <Link href="/explore">
                Clear Filter
              </Link>
            </Button>
          )}
        </div>

        {/* Client component with infinite scroll */}
        <ExploreClient
          key={`${query}-${tagFilter}`} // Force remount when filters change
          initialPaths={paths}
          initialTotal={total}
          initialHasMore={hasMore}
          userId={userId}
          searchQuery={query}
          tagFilter={tagFilter}
        />
      </main>
    </div>
  );
}
