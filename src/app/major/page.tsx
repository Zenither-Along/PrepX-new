import { createSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export default async function MajorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const supabase = createSupabaseClient();
  const { data: majorPath } = await supabase
    .from("learning_paths")
    .select("id")
    .eq("user_id", userId)
    .eq("is_major", true)
    .single();

  if (majorPath) {
    redirect(`/path/${majorPath.id}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center px-12">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            Major Path
          </h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50">
          <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Major Path Selected</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Select a learning path as your "Major Path" to have quick access to it right from here.
        </p>
        <Link href="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </main>
    </div>
  );
}
