"use client";

import { ArrowLeft, Pencil, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AssignmentProgressBar } from "@/components/assignments/AssignmentProgressBar";
import { useSearchParams } from "next/navigation";
import { usePathData } from "./hooks/usePathData";
import { useAssignmentLogic } from "./hooks/useAssignmentLogic";
import { useColumnResizer } from "@/hooks/useColumnResizer";
import { MobilePathView } from "./components/MobilePathView";
import { DesktopPathView } from "./components/DesktopPathView";

export default function ViewPathPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("backUrl");

  // Custom Hooks
  const {
    path,
    columns,
    items,
    sections,
    loading,
    selectedItems,
    activeColumnIndex,
    setActiveColumnIndex,
    onSelectItem,
    goBackColumn
  } = usePathData(id as string);

  const {
    currentAssignment,
    completedSections,
    handleCompleteAssignment,
    handleToggleSection,
    isCompleting,
    profile,
    progress
  } = useAssignmentLogic(id as string, columns);

  const { 
    columnWidths, 
    handleResizeStart 
  } = useColumnResizer({
    minWidth: (columnId) => {
      const col = columns.find(c => c.id === columnId);
      return col?.type === 'branch' ? 80 : 400;
    },
    maxWidth: (columnId) => {
      const col = columns.find(c => c.id === columnId);
      return col?.type === 'branch' ? 300 : 1500;
    }
  });

  // Local UI State
  const [activePanels, setActivePanels] = useState<Map<string, 'chat' | 'quiz' | null>>(new Map());
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add app-page class to body for viewport control
  useEffect(() => {
    document.body.classList.add('app-page');
    return () => {
      document.body.classList.remove('app-page');
    };
  }, []);

  const togglePanel = (columnId: string, panel: 'chat' | 'quiz') => {
    setActivePanels(prev => {
      const next = new Map(prev);
      if (next.get(columnId) === panel) {
        next.set(columnId, null);
      } else {
        next.set(columnId, panel);
      }
      return next;
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Path...</div>;
  if (!path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className={cn(
        "h-14 md:h-16 items-center justify-between border-b border-border px-4",
        activeColumnIndex > 0 ? "hidden md:flex" : "flex"
      )}>
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent hover:text-accent-foreground shrink-0">
            <Link href={backUrl || "/"}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="h-6 w-px bg-border shrink-0" />
          <h1 className="text-base md:text-lg font-bold flex items-center gap-2 truncate">
            {path.is_major && <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 shrink-0" />}
            {path.title}
          </h1>
        </div>
        {/* Hide edit button for students viewing assignments */}
        {(!currentAssignment || profile?.role !== 'student') && (
          <Button size="sm" asChild className="bg-black text-white hover:bg-gray-800 shrink-0 hidden md:flex">
            <Link href={`/path/${id}/edit`} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <span className="hidden md:inline">Edit Path</span>
            </Link>
          </Button>
        )}
      </header>

      {/* Assignment Progress Bar */}
      {currentAssignment && profile?.role === 'student' && (
        <AssignmentProgressBar 
          assignmentTitle={path.title}
          currentProgress={progress}
          completedSections={completedSections.size}
          totalSections={currentAssignment.total_sections || 0}
          status={currentAssignment.submission_status}
          onComplete={handleCompleteAssignment}
          isCompleting={isCompleting}
        />
      )}

      {/* Main layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile: Single column view */}
        <div className="md:hidden flex-1 overflow-y-auto">
          <MobilePathView 
            columns={columns}
            activeColumnIndex={activeColumnIndex}
            items={items}
            sections={sections}
            selectedItems={selectedItems}
            activePanels={activePanels}
            currentAssignment={currentAssignment}
            completedSections={completedSections}
            profile={profile}
            pathId={id as string}
            onSelectItem={(columnId, itemId) => onSelectItem(columnId, itemId, true)}
            goBackColumn={goBackColumn}
            togglePanel={togglePanel}
            handleToggleSection={handleToggleSection}
          />
        </div>

        {/* Desktop: Horizontal scroll with all columns */}
        <DesktopPathView 
          columns={columns}
          items={items}
          sections={sections}
          selectedItems={selectedItems}
          activePanels={activePanels}
          columnWidths={columnWidths}
          currentAssignment={currentAssignment}
          completedSections={completedSections}
          profile={profile}
          pathId={id as string}
          onSelectItem={(columnId, itemId) => onSelectItem(columnId, itemId, false)}
          togglePanel={togglePanel}
          handleToggleSection={handleToggleSection}
          handleResizeStart={handleResizeStart}
        />
      </main>
    </div>
  );
}
