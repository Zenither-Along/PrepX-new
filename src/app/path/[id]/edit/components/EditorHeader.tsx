"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function EditorHeader({ 
  showAIColumn, 
  setShowAIColumn,
  editorData,
  editorSave
}: { 
  showAIColumn: boolean; 
  setShowAIColumn: (v: boolean) => void;
  editorData: any;
  editorSave: any;
}) {
  return (
    <header className="flex h-20 flex-col justify-center border-b border-border px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent hover:text-accent-foreground shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="h-6 w-px bg-border shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <input
              type="text"
              value={editorData.path?.title ?? ""}
              onChange={(e) => {
                editorData.setPath({ ...editorData.path!, title: e.target.value });
                editorSave.setHasUnsavedChanges(true);
              }}
              className="text-lg font-bold truncate bg-transparent focus:outline-none"
              placeholder="Path Title"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showAIColumn ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowAIColumn(!showAIColumn)}
            className="mr-2"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={editorSave.handleSave}
            disabled={editorSave.saving}
          >
            {editorSave.saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </header>
  );
}
