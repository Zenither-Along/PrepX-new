"use client";

import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useEditorData } from "./hooks/useEditorData";
import { useEditorSave } from "./hooks/useEditorSave";
import { useColumnResizer } from "./hooks/useColumnResizer";
import { EditorHeader } from "./components/EditorHeader";
import { EditorCanvas } from "./components/EditorCanvas";
import { AIAssistantPanel } from "./components/AIAssistantPanel";
import { useExecutePlan } from "./hooks/useExecutePlan";

export default function EditorPage() {
  const { id } = useParams();
  const { user } = useUser();

  // Use custom hooks
  const editorData = useEditorData(id);
  
  const editorSave = useEditorSave(
    id,
    editorData.path,
    editorData.columns,
    editorData.items,
    editorData.sections,
  );

  const [selectedItems, setSelectedItems] = useState<Map<string, string>>(new Map()); // columnId -> itemId
  const [editingItemId, setEditingItemId] = useState<string | undefined>();
  const [showAIColumn, setShowAIColumn] = useState(false);

  const { 
    columnWidths, 
    handleResizeStart 
  } = useColumnResizer(editorData.columns);

  const onExecutePlan = useExecutePlan(editorData, editorSave);

  if (editorData.loading) return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
  if (!editorData.path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <EditorHeader 
        showAIColumn={showAIColumn} 
        setShowAIColumn={setShowAIColumn} 
        editorData={editorData}
        editorSave={editorSave}
      />

      <EditorCanvas 
        editorData={editorData}
        editorSave={editorSave}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        editingItemId={editingItemId}
        setEditingItemId={setEditingItemId}
        columnWidths={columnWidths}
        handleResizeStart={handleResizeStart}
        showAIColumn={showAIColumn}
      >
        <AIAssistantPanel 
          showAIColumn={showAIColumn} 
          setShowAIColumn={setShowAIColumn}
          editorData={editorData}
          editorSave={editorSave}
          onExecutePlan={onExecutePlan}
        />
      </EditorCanvas>
    </div>
  );
}
