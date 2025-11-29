"use client";

import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useEditorData } from "./hooks/useEditorData";
import { useEditorSave } from "./hooks/useEditorSave";
import { useColumnResizer } from "./hooks/useColumnResizer";
import { EditorHeader } from "./components/EditorHeader";
import { EditorCanvas } from "./components/EditorCanvas";
import { AIAssistantPanel } from "./components/AIAssistantPanel";
import { useExecutePlan } from "./hooks/useExecutePlan";
import { useAISectionEditor } from "./hooks/useAISectionEditor";

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
  const [editingSection, setEditingSection] = useState<any | null>(null);

  // Mobile navigation state
  const [isMobile, setIsMobile] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile back navigation
  const goBackColumn = () => {
    setActiveColumnIndex(prev => Math.max(0, prev - 1));
  };

  const { 
    columnWidths, 
    handleResizeStart 
  } = useColumnResizer(editorData.columns);

  const onExecutePlan = useExecutePlan(editorData, editorSave);
  const { handleSectionSendToAI } = useAISectionEditor(setShowAIColumn, setEditingSection);

  // Add app-page class to body for viewport control
  useEffect(() => {
    document.body.classList.add('app-page');
    return () => {
      document.body.classList.remove('app-page');
    };
  }, []);

  if (editorData.loading) return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
  if (!editorData.path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
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
        onSectionSendToAI={handleSectionSendToAI}
        isMobile={isMobile}
        activeColumnIndex={activeColumnIndex}
        setActiveColumnIndex={setActiveColumnIndex}
        goBackColumn={goBackColumn}
      >
        <AIAssistantPanel 
          showAIColumn={showAIColumn} 
          setShowAIColumn={setShowAIColumn}
          editorData={editorData}
          editorSave={editorSave}
          onExecutePlan={onExecutePlan}
          isMobile={isMobile}
          editingSection={editingSection}
          setEditingSection={setEditingSection}
        />
      </EditorCanvas>
    </div>
  );
}
