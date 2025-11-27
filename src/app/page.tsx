"use client";

import { UserButton } from "@clerk/nextjs";
import { BookOpen, Star, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { LandingPage } from "@/components/LandingPage";
import { PathCard } from "@/components/home/PathCard";
import { CreatePathDialog } from "@/components/home/CreatePathDialog";
import { EditDescriptionDialog } from "@/components/home/EditDescriptionDialog";
import { PathGeneratorDialog } from "@/components/path-generator/PathGeneratorDialog";
import { saveGeneratedPath } from "@/lib/ai/saveGeneratedPath";
import { usePathManager } from "@/hooks/usePathManager";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSupabase } from "@/lib/useSupabase";

export default function Home() {
  const router = useRouter();
  const [isSavingAI, setIsSavingAI] = useState(false);
  const supabase = useSupabase();
  
  const {
    user,
    isLoaded,
    paths,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    newPathTitle,
    setNewPathTitle,
    isCreating,
    handleCreatePath,
    handleDelete,
    isDescDialogOpen,
    setIsDescDialogOpen,
    editingDescription,
    setEditingDescription,
    isSavingDesc,
    handleOpenDescDialog,
    handleSaveDescription,
    handleSetMajor,
    handleUnsetMajor,
    handlePublish
  } = usePathManager();

  const handlePathGenerated = async (pathData: any) => {
    if (!user) return;
    
    setIsSavingAI(true);
    try {
      const pathId = await saveGeneratedPath(supabase, user.id, pathData);
      // Refresh the page or paths list
      router.push(`/path/${pathId}/edit`);
    } catch (error: any) {
      console.error("Failed to save generated path:", error);
      alert("Failed to save path: " + error.message);
    } finally {
      setIsSavingAI(false);
    }
  };

  if (!isLoaded) return null;

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-full bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Logo width={140} height={48} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/explore">
              <Button variant="ghost" size="icon" className="md:w-auto md:px-4">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Explore</span>
              </Button>
            </Link>
            <Link href="/major">
              <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50">
                <Star className="h-5 w-5" />
              </Button>
            </Link>
            <ModeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-4 py-6 md:px-12 md:py-12">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Hello, {user?.firstName || user?.username || 'there'}!</h1>
            <p className="mt-1 text-muted-foreground">Welcome to Your PrepX</p>
          </div>
          
          <div className="flex gap-2">
            <PathGeneratorDialog onPathGenerated={handlePathGenerated} />
            <CreatePathDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              title={newPathTitle}
              onTitleChange={setNewPathTitle}
              onCreate={handleCreatePath}
              isCreating={isCreating}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[120px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No paths created yet</h3>
            <p className="mt-2 max-w-sm text-gray-500">
              Start your learning journey by creating your first structured path.
            </p>
            <CreatePathDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              title={newPathTitle}
              onTitleChange={setNewPathTitle}
              onCreate={handleCreatePath}
              isCreating={isCreating}
              trigger={
                <Button 
                  className="mt-8" 
                  variant="outline"
                >
                  Create Path
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map((path) => (
              <PathCard 
                key={path.id}
                path={path}
                onDelete={handleDelete}
                onEditDescription={handleOpenDescDialog}
                onSetMajor={handleSetMajor}
                onUnsetMajor={handleUnsetMajor}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}

        <EditDescriptionDialog 
          open={isDescDialogOpen}
          onOpenChange={setIsDescDialogOpen}
          description={editingDescription}
          onDescriptionChange={setEditingDescription}
          onSave={handleSaveDescription}
          isSaving={isSavingDesc}
        />
      </main>
    </div>
  );
}
