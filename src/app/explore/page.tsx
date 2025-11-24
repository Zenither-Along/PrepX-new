import { getPublicPaths } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clonePath } from "@/lib/actions/actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Logo } from "@/components/logo";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { userId } = await auth();
  const { q, tag } = await searchParams;
  const query = q || "";
  const tagFilter = tag || "";
  
  const paths = await getPublicPaths(query, tagFilter);

  async function handleClone(pathId: string) {
    "use server";
    try {
      await clonePath(pathId);
    } catch (error) {
      console.error("Clone failed:", error);
    }
    redirect("/");
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-12">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Logo width={140} height={48} />
          </div>
          <div className="flex items-center gap-4 w-1/3">
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

      <main className="mx-auto px-12 py-12">
        {/* Tags Filter (Mock for now, or dynamic if we had a tags table) */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {["React", "Next.js", "Python", "Design", "Interview"].map((t) => (
            <Link key={t} href={`/explore?tag=${t}`}>
              <Badge variant={tagFilter === t ? "default" : "outline"} className="cursor-pointer px-4 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground">
                {t}
              </Badge>
            </Link>
          ))}
          {tagFilter && (
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="h-8">Clear Filter</Button>
            </Link>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paths?.map((path: any) => (
            <Card key={path.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="line-clamp-1 text-lg">{path.title}</CardTitle>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground min-h-[40px]">
                  {path.subtitle || "No description provided."}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {path.tags?.slice(0, 3).map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
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
                
                {userId !== path.user_id && (
                  <form action={handleClone.bind(null, path.id)}>
                    <Button size="sm" variant="secondary" className="gap-2">
                      <Copy className="h-3.5 w-3.5" />
                      Clone
                    </Button>
                  </form>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {paths?.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold">No paths found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
