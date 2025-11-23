import { useState, useEffect } from "react";
import { Column } from "../types";

export function useColumnResizer(columns: Column[]) {
  const [columnWidths, setColumnWidths] = useState<Map<string, number>>(new Map());
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    setResizing({ columnId, startX: e.clientX, startWidth: currentWidth });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = resizing.startWidth + delta;
      
      // Find column to get type for constraints
      const column = columns.find(c => c.id === resizing.columnId);
      if (!column) return;
      
      // Apply constraints based on column type
      const minWidth = 200;
      const maxWidth = column.type === 'branch' ? 600 : 1200;
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setColumnWidths(prev => new Map(prev).set(resizing.columnId, constrainedWidth));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, columns]);

  return {
    columnWidths,
    handleResizeStart
  };
}
