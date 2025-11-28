import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { createPath, deletePath, updatePathSubtitle, setMajorPath, unsetMajorPath, publishPath } from "@/lib/actions/actions";

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
  is_major?: boolean;
  is_public?: boolean;
  original_path_id?: string | null;
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
      console.error("Error creating path:", error);
      alert("Failed to create path");
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this path?")) return;
    
    try {
      await deletePath(id);
      // Remove from UI after successful deletion
      setPaths(paths.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting path:", error);
      alert("Failed to delete path. Please try again.");
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
      alert("Failed to update description. Please try again.");
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
      alert("Failed to set major path");
    }
  };

  const handleUnsetMajor = async (id: string) => {
    try {
      await unsetMajorPath(id);
      // Optimistic update
      setPaths(paths.map(p => p.id === id ? { ...p, is_major: false } : p));
    } catch (error) {
      console.error("Error unsetting major path:", error);
      alert("Failed to unset major path");
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      await publishPath(id, !currentStatus);
      setPaths(paths.map(p => p.id === id ? { ...p, is_public: !currentStatus } : p));
    } catch (error) {
      console.error("Error publishing path:", error);
      alert("Failed to update publication status");
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
    handlePublish
  };
}
