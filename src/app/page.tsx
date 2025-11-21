"use client";

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { Plus, BookOpen, MoreVertical, Trash2, Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { createPath, deletePath } from "@/lib/actions/actions";

interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
  branchCount?: number;
  itemCount?: number;
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPathTitle, setNewPathTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">PrepX</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hello, {user?.firstName || user?.username || 'there'}!</h1>
            <p className="mt-2 text-gray-500">Manage and organize your learning journeys.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200/50">
                <Plus className="mr-2 h-4 w-4" />
                New Path
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
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {isCreating ? "Creating..." : "Create Path"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[200px] rounded-xl bg-gray-100 animate-pulse" />
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => (
              <Card key={path.id} className="group relative overflow-hidden border-gray-200 bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/path/${path.id}`} className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                        {path.title}
                      </CardTitle>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/path/${path.id}/edit`} className="flex items-center cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(path.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2">{path.subtitle || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>{path.branchCount || 0} Branches</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{path.itemCount || 0} Items</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
