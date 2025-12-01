import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { createPath, deletePath, updatePathSubtitle, setMajorPath, unsetMajorPath, publishPath } from "@/lib/actions/actions";
import { toast } from "@/hooks/use-toast";

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
  is_major?: boolean;
  is_public?: boolean;
  original_path_id?: string | null;
  status?: 'generating' | 'ready' | 'error';
}

export function usePathManager() {
  const { user, isLoaded } = useUser();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPathTitle, setNewPathTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Description dialog states
  const [isDescDialogOpen, setIsDescDialogOpen] = useState(false);
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pathToDelete, setPathToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaths();
    }
  }, [user]);

  const fetchPaths = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      // First fetch the paths
      const { data: pathsData, error: pathsError } = await db
        .from("learning_paths")
        .select("*")
        .eq("user_id", user.id)
        .order("is_major", { ascending: false })
        .order("created_at", { ascending: false });

      if (pathsError) throw pathsError;

      setPaths(pathsData || []);
    } catch (error) {
      console.error("Error fetching paths:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async () => {
    if (!newPathTitle.trim()) return;
    
    setIsCreating(true);
    try {
      await createPath(newPathTitle);
      // The server action redirects, so we don't need to do anything here
      // But just in case:
      setIsDialogOpen(false);
      setNewPathTitle("");
    } catch (error) {
      // Ignore NEXT_REDIRECT errors - they're thrown by Next.js redirect() as part of normal operation
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error("Error creating path:", error);
      toast({
        variant: "destructive",
        title: "Failed to create path",
        description: "Please try again.",
      });
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPathToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pathToDelete) return;
    
    try {
      await deletePath(pathToDelete);
      // Remove from UI after successful deletion
      setPaths(paths.filter(p => p.id !== pathToDelete));
      setIsDeleteDialogOpen(false);
      setPathToDelete(null);
    } catch (error) {
      console.error("Error deleting path:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete path",
        description: "Please try again.",
      });
    }
  };

  const handleOpenDescDialog = (pathId: string, currentSubtitle: string) => {
    setEditingPathId(pathId);
    setEditingDescription(currentSubtitle || "");
    setIsDescDialogOpen(true);
  };

  const handleSaveDescription = async () => {
    if (!editingPathId) return;
    
    setIsSavingDesc(true);
    try {
      await updatePathSubtitle(editingPathId, editingDescription);
      // Update UI
      setPaths(paths.map(p => 
        p.id === editingPathId ? { ...p, subtitle: editingDescription } : p
      ));
      setIsDescDialogOpen(false);
      setEditingPathId(null);
      setEditingDescription("");
    } catch (error) {
      console.error("Error updating description:", error);
      toast({
        variant: "destructive",
        title: "Failed to update description",
        description: "Please try again.",
      });
    } finally {
      setIsSavingDesc(false);
    }
  };

  const handleSetMajor = async (id: string) => {
    try {
      await setMajorPath(id);
      // Optimistic update
      setPaths(paths.map(p => ({
        ...p,
        is_major: p.id === id
      })).sort((a, b) => (a.id === id ? -1 : b.id === id ? 1 : 0)));
    } catch (error) {
      console.error("Error setting major path:", error);
      toast({
        variant: "destructive",
        title: "Failed to set major path",
        description: "Please try again.",
      });
    }
  };

  const handleUnsetMajor = async (id: string) => {
    try {
      await unsetMajorPath(id);
      // Optimistic update
      setPaths(paths.map(p => p.id === id ? { ...p, is_major: false } : p));
    } catch (error) {
      console.error("Error unsetting major path:", error);
      toast({
        variant: "destructive",
        title: "Failed to unset major path",
        description: "Please try again.",
      });
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      await publishPath(id, !currentStatus);
      setPaths(paths.map(p => p.id === id ? { ...p, is_public: !currentStatus } : p));
    } catch (error) {
      console.error("Error publishing path:", error);
      toast({
        variant: "destructive",
        title: "Failed to update publication status",
        description: "Please try again.",
      });
    }
  };

  return {
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
    fetchPaths,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    confirmDelete,
  };
}
