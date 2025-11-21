"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { ContentRenderer } from "@/components/view/ContentRenderer";
import { cn } from "@/lib/utils";

export default function ViewPathPage() {
  const { id } = useParams();
  const router = useRouter();
  const [path, setPath] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedItemId) fetchSections(selectedItemId);
    else setSections([]);
  }, [selectedItemId]);

  const fetchData = async () => {
    try {
      const { data: pathData, error: pathError } = await db
        .from("learning_paths")
        .select("*")
        .eq("id", id)
        .single();

      if (pathError) throw pathError;
      setPath(pathData);

      const { data: branchData, error: branchError } = await db
        .from("branches")
        .select("*")
        .eq("path_id", id)
        .order("order_index", { ascending: true })
        .limit(1)
        .single();

      if (branchError && branchError.code !== 'PGRST116') throw branchError;

      if (branchData) {
        setBranch(branchData);
        const { data: itemsData, error: itemsError } = await db
          .from("branch_items")
          .select("*")
          .eq("branch_id", branchData.id)
          .order("order_index", { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
        if (itemsData && itemsData.length > 0) {
          setSelectedItemId(itemsData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching path data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (itemId: string) => {
    try {
      const { data, error } = await db
        .from("content_sections")
        .select("*")
        .eq("item_id", itemId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Path...</div>;
  if (!path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-screen flex-col bg-white text-black">
      {/* Navigation Bar */}
      <header className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-lg font-bold truncate max-w-[300px]">{path.title}</h1>
        </div>

        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href={`/path/${id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit Path
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar (Branch Items) */}
        <aside className="w-80 overflow-y-auto border-r border-gray-100 bg-gray-50 p-6">
          <h2 className="mb-6 text-xl font-bold">{branch?.title || "Contents"}</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={cn(
                  "w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                  selectedItemId === item.id
                    ? "bg-black text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-4xl font-bold tracking-tight">
              {items.find((i) => i.id === selectedItemId)?.title}
            </h1>
            
            <div className="space-y-8">
              {sections.length === 0 ? (
                <p className="text-gray-400 italic">No content in this section.</p>
              ) : (
                sections.map((section) => (
                  <ContentRenderer key={section.id} type={section.type} content={section.content} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
