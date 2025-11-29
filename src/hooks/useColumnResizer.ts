import { useState, useEffect } from "react";

export interface ColumnResizeOptions {
  minWidth?: number | ((columnId: string) => number);
  maxWidth?: number | ((columnId: string) => number);
}

export function useColumnResizer(
  options: ColumnResizeOptions = {}
) {
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
      
      let min = 200;
      let max = 1200;

      if (typeof options.minWidth === 'number') min = options.minWidth;
      else if (typeof options.minWidth === 'function') min = options.minWidth(resizing.columnId);

      if (typeof options.maxWidth === 'number') max = options.maxWidth;
      else if (typeof options.maxWidth === 'function') max = options.maxWidth(resizing.columnId);

      const constrainedWidth = Math.max(min, Math.min(max, newWidth));
      
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
  }, [resizing, options]);

  return {
    columnWidths,
    handleResizeStart,
    isResizing: !!resizing
  };
}
