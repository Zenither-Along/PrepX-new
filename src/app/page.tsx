"use client";

import { UserButton } from "@clerk/nextjs";
import { BookOpen, Star, Globe, School, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { LandingPage } from "@/components/LandingPage";
import { PathCard } from "@/components/home/PathCard";
import { UnifiedPathDialog } from "@/components/home/UnifiedPathDialog";
import { EditDescriptionDialog } from "@/components/home/EditDescriptionDialog";
import { PdfUploadDialog } from "@/components/home/PdfUploadDialog";
import { GenerationProgressCard } from "@/components/home/GenerationProgressCard";
import { saveGeneratedPath } from "@/lib/ai/saveGeneratedPath";
import { usePathManager } from "@/hooks/usePathManager";
import { usePathGeneration } from "@/context/PathGenerationContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/useSupabase";

export default function Home() {
  const router = useRouter();
  const [isSavingAI, setIsSavingAI] = useState(false);
  const supabase = useSupabase();
  const { jobs } = usePathGeneration();
  
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
    handlePublish,
    fetchPaths
  } = usePathManager();

  const handlePathGenerated = async (pathData: any) => {
    if (!user) return;
    
    setIsSavingAI(true);
    try {
      const pathId = await saveGeneratedPath(supabase, user.id, pathData);
      // Refresh the page or paths list
      router.push(`/path/${pathId}/edit`);
    } catch (error: unknown) {
      console.error("Failed to save generated path:", error);
      alert("Failed to save path: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSavingAI(false);
    }
  };

  // Add app-page class to body for viewport control (only when logged in)
  useEffect(() => {
    if (user) {
      document.body.classList.add('app-page');
    }
    return () => {
      document.body.classList.remove('app-page');
    };
  }, [user]);

  // Filter out generating paths from the main list as they are shown in jobs
  // Also exclude paths that are in 'generating' status but not in jobs (stale state handling)
  const readyPaths = paths.filter(p => p.status !== 'generating');
  const activeJobs = Object.values(jobs);

  // Handle completed jobs - Auto-refresh when a job becomes ready
  useEffect(() => {
    const readyJob = activeJobs.find(job => job.status === 'ready');
    if (readyJob) {
      fetchPaths();
    }
  }, [activeJobs, fetchPaths]);

  return (
    <div className="h-full overflow-y-auto bg-background">
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
            <Link href="/classrooms">
              <Button variant="ghost" size="icon" className="md:w-auto md:px-4">
                <School className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Classrooms</span>
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
          
          <div className="flex items-center gap-2">
            <PdfUploadDialog />
            <UnifiedPathDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              title={newPathTitle}
              onTitleChange={setNewPathTitle}
              onCreate={handleCreatePath}
              isCreating={isCreating}
              onPathGenerated={handlePathGenerated}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[120px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : readyPaths.length === 0 && activeJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No paths created yet</h3>
            <p className="mt-2 max-w-sm text-gray-500">
              Start your learning journey by creating your first structured path.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <PdfUploadDialog />
              <UnifiedPathDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={newPathTitle}
                onTitleChange={setNewPathTitle}
                onCreate={handleCreatePath}
                isCreating={isCreating}
                onPathGenerated={handlePathGenerated}
                trigger={
                  <Button variant="outline">
                    Create Path
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Active Jobs (Generating) */}
            {activeJobs.map((job) => (
              <GenerationProgressCard
                key={job.pathId}
                title="Processing PDF..." // We could fetch the title if we want, but "Processing" is fine for now
                progress={job.progress}
                message={job.message}
                status={job.status}
              />
            ))}

            {/* Ready Paths */}
            {readyPaths.map((path) => (
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
