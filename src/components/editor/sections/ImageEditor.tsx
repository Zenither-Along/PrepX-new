"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

interface ImageEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function ImageEditor({ content, onChange }: ImageEditorProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [localSize, setLocalSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isResizing) {
      setLocalSize({
        width: content.width || 0,
        height: content.height || 0
      });
    }
  }, [content.width, content.height, isResizing]);

  return (
    <div className="space-y-2" ref={containerRef}>

      {content.url ? (
        <div className="relative group/image block md:inline-block w-full md:w-auto max-w-full">
          <div 
            className="relative rounded-lg border border-border bg-card overflow-hidden w-full max-w-full"
            style={{ 
              // On mobile (< 768px), always use 100% width. On desktop, use saved dimensions
              width: typeof window !== 'undefined' && window.innerWidth < 768 
                ? '100%' 
                : (isResizing && localSize.width ? `${localSize.width}px` : (content.width ? `${content.width}px` : 'auto')),
              height: typeof window !== 'undefined' && window.innerWidth < 768
                ? 'auto'
                : (isResizing && localSize.height ? `${localSize.height}px` : (content.height ? `${content.height}px` : 'auto'))
            }}
          >
            <img 
              src={content.url} 
              alt="Content" 
              className="w-full h-full object-contain"
              draggable={false}
            />
            
            {/* Resize Handle */}
            <div
              className="absolute bottom-0 right-0 h-6 w-6 cursor-nwse-resize opacity-0 group-hover/image:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;
                const startHeight = e.currentTarget.parentElement?.offsetHeight || 0;
                const maxWidth = containerRef.current?.offsetWidth || 1000;
                
                // Calculate initial aspect ratio
                const aspectRatio = startWidth / startHeight;

                // Initialize local size
                setLocalSize({ width: startWidth, height: startHeight });

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                  }

                  animationFrameRef.current = requestAnimationFrame(() => {
                    const newWidth = startWidth + (moveEvent.clientX - startX);
                    
                    // Constrain width to parent container and min width
                    const constrainedWidth = Math.min(Math.max(100, newWidth), maxWidth);
                    // Calculate height based on aspect ratio
                    const constrainedHeight = constrainedWidth / aspectRatio;

                    setLocalSize({ 
                      width: constrainedWidth,
                      height: constrainedHeight
                    });
                  });
                };

                // Revised approach for mouseUp:
                const handleMouseUpWithCommit = (upEvent: MouseEvent) => {
                   document.removeEventListener('mousemove', handleMouseMove);
                   document.removeEventListener('mouseup', handleMouseUpWithCommit);
                   if (animationFrameRef.current) {
                     cancelAnimationFrame(animationFrameRef.current);
                   }
                   
                   const finalWidth = startWidth + (upEvent.clientX - startX);
                   
                   const constrainedWidth = Math.min(Math.max(100, finalWidth), maxWidth);
                   const constrainedHeight = constrainedWidth / aspectRatio;
                   
                   setIsResizing(false);
                   onChange({ 
                     ...content, 
                     width: constrainedWidth,
                     height: constrainedHeight
                   });
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUpWithCommit);
              }}
            >
              <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br bg-primary/50" />
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2 bg-card opacity-0 group-hover/image:opacity-100 transition-opacity"
            onClick={() => onChange({ ...content, url: "", width: undefined, height: undefined })}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      onChange({ ...content, url: e.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              Choose file
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <span className="flex items-center gap-1">
                🔗 URL
              </span>
            </Button>
          </div>
          <Input
            type="text"
            placeholder="https://..."
            onBlur={(e) => onChange({ ...content, url: e.target.value })}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
