"use client";

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { Plus, BookOpen, MoreVertical, Trash2, Pencil, Eye, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { createPath, deletePath, updatePathSubtitle, setMajorPath, unsetMajorPath } from "@/lib/actions/actions";

interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
  branchCount?: number;
  itemCount?: number;
  is_major?: boolean;
}

export default function Home() {
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

      // For each path, count branches and items
      const pathsWithCounts = await Promise.all(
        (pathsData || []).map(async (path) => {
          // Count branches
          const { count: branchCount } = await db
            .from("branches")
            .select("*", { count: "exact", head: true })
            .eq("path_id", path.id);

          // Count items across all branches
          const { count: itemCount } = await db
            .from("branch_items")
            .select("*", { count: "exact", head: true })
            .eq("path_id", path.id);

          return {
            ...path,
            branchCount: branchCount || 0,
            itemCount: itemCount || 0,
          };
        })
      );

      setPaths(pathsWithCounts);
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

  if (!isLoaded) return null;

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Welcome to PrepX</h1>
          <p className="mb-8 text-gray-600">Please sign in to manage your learning paths.</p>
          <SignInButton mode="modal">
            <Button className="bg-black text-white hover:bg-gray-800">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">PrepX</span>
          </div>
          <div className="flex items-center gap-4">
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
      <main className="mx-auto px-12 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Hello, {user?.firstName || user?.username || 'there'}!</h1>
            <p className="mt-1 text-muted-foreground">Welcome to Your PrepX</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Path
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Path</DialogTitle>
                <DialogDescription>
                  Give your learning path a clear and descriptive title.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Mastering React Patterns"
                    value={newPathTitle}
                    onChange={(e) => setNewPathTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreatePath()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreatePath} 
                  disabled={!newPathTitle.trim() || isCreating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isCreating ? "Creating..." : "Create Path"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Button 
              className="mt-8" 
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
            >
              Create Path
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map((path) => (
              <Card key={path.id} className={`group relative overflow-hidden border-border bg-card hover:shadow-md transition-shadow h-[155px] flex flex-col ${path.is_major ? 'border-yellow-400 ring-1 ring-yellow-400 bg-yellow-50/10' : ''}`}>
                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/path/${path.id}`} className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                        {path.is_major && <Star className="h-4 w-4 text-yellow-500" />}
                        {path.title}
                      </CardTitle>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-1">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDescDialog(path.id, path.subtitle)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Add Description
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/path/${path.id}/edit`} className="flex items-center cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {path.is_major ? (
                          <DropdownMenuItem onClick={() => handleUnsetMajor(path.id)}>
                            <Star className="mr-2 h-4 w-4 fill-none" />
                            Unset Major
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSetMajor(path.id)}>
                            <Star className="mr-2 h-4 w-4 text-yellow-500" />
                            Set as Major
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(path.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-10">
                    {path.subtitle && path.subtitle !== "Add a description" ? path.subtitle : ""}
                  </p>
                </CardHeader>
                <CardFooter className="pt-2 pb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{new Date(path.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Description Dialog */}
        <Dialog open={isDescDialogOpen} onOpenChange={setIsDescDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Description</DialogTitle>
              <DialogDescription>
                Add a brief description to help you remember what this learning path is about.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., A comprehensive guide to modern React development"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDescDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSaveDescription} 
                disabled={isSavingDesc}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSavingDesc ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
