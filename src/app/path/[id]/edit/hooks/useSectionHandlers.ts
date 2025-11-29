import { ContentSection } from '../types';

export function useSectionHandlers(
  editorData: any,
  editorSave: any
) {
  const handleAddSection = (
    columnId: string, 
    type: 'heading' | 'paragraph' | 'image' | 'video' | 'code' | 'subheading' | 'rich-text',
    initialContent?: string
  ) => {
    // Determine content based on type and initialContent
    let content;
    if (type === 'heading' || type === 'paragraph' || type === 'subheading') {
      content = { text: initialContent || '' };
    } else if (type === 'rich-text') {
      content = { html: initialContent || '' };
    } else if (type === 'code') {
      content = { code: initialContent || '', language: 'javascript' };
    } else {
      content = { url: initialContent || '' };
    }
    
    const newSection = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      column_id: columnId,
      type,
      content,
      order_index: editorData.sections.filter((s: ContentSection) => s.column_id === columnId).length
    };
    
    editorData.setSections((prev: ContentSection[]) => [...prev, newSection]);
    editorSave.setNewSections((prev: Set<string>) => new Set(prev).add(newSection.id));
    editorSave.setHasUnsavedChanges(true);
  };

  const handleUpdateSection = (sectionId: string, content: any) => {
    editorData.setSections((prev: ContentSection[]) => prev.map((s: ContentSection) => s.id === sectionId ? { ...s, content } : s));
    editorSave.setHasUnsavedChanges(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    editorData.setSections((prev: ContentSection[]) => prev.filter((s: ContentSection) => s.id !== sectionId));
    editorSave.setDeletedSections((prev: Set<string>) => new Set(prev).add(sectionId));
    editorSave.setHasUnsavedChanges(true);
  };

  const handleSectionReorder = (columnId: string, newSections: any[]) => {
    // Filter out sections not in this column
    const otherSections = editorData.sections.filter((s: ContentSection) => s.column_id !== columnId);
    
    // Update order_index for new sections
    const reordered = newSections.map((s, idx) => ({ ...s, order_index: idx }));
    
    editorData.setSections([...otherSections, ...reordered]);
    editorSave.setHasUnsavedChanges(true);
  };

  return {
    handleAddSection,
    handleUpdateSection,
    handleDeleteSection,
    handleSectionReorder
  };
}
