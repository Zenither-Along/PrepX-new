"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

interface VideoEditorProps {
  content: any;
  onChange: (content: any) => void;
}

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};

export function VideoEditor({ content, onChange }: VideoEditorProps) {
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
      <label className="block text-xs font-medium text-muted-foreground">Video</label>
      {content.url ? (
        <div className="relative group/video inline-block max-w-full">
          <div 
            className="relative rounded-lg border border-gray-200 bg-black overflow-hidden"
            style={{ 
              width: isResizing && localSize.width ? `${localSize.width}px` : (content.width ? `${content.width}px` : '100%'),
              height: isResizing && localSize.height ? `${localSize.height}px` : (content.height ? `${content.height}px` : 'auto'),
              maxWidth: '100%',
              aspectRatio: isResizing || content.width ? 'auto' : '16/9'
            }}
          >
            {content.isLocalFile ? (
              <video 
                src={content.url} 
                className="w-full h-full" 
                controls
              />
            ) : (
              <iframe 
                src={getEmbedUrl(content.url)} 
                className="w-full h-full" 
                allowFullScreen 
              />
            )}
            
            {/* Resize Handle */}
            <div
              className="absolute bottom-0 right-0 h-6 w-6 cursor-nwse-resize opacity-0 group-hover/video:opacity-100 transition-opacity z-10"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);

                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;
                const startHeight = e.currentTarget.parentElement?.offsetHeight || 0;
                const maxWidth = containerRef.current?.offsetWidth || 1000;

                // Initialize local size
                setLocalSize({ width: startWidth, height: startHeight });

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                  }

                  animationFrameRef.current = requestAnimationFrame(() => {
                    const newWidth = startWidth + (moveEvent.clientX - startX);
                    const newHeight = startHeight + (moveEvent.clientY - startY);
                    
                    // Constrain width to parent container and min width
                    const constrainedWidth = Math.min(Math.max(200, newWidth), maxWidth);
                    const constrainedHeight = Math.max(112, newHeight);

                    setLocalSize({ 
                      width: constrainedWidth,
                      height: constrainedHeight
                    });
                  });
                };

                const handleMouseUpWithCommit = (upEvent: MouseEvent) => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUpWithCommit);
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                  }

                  const finalWidth = startWidth + (upEvent.clientX - startX);
                  const finalHeight = startHeight + (upEvent.clientY - startY);
                  
                  const constrainedWidth = Math.min(Math.max(200, finalWidth), maxWidth);
                  const constrainedHeight = Math.max(112, finalHeight);

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
              <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br bg-blue-500/50" />
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2 bg-card opacity-0 group-hover/video:opacity-100 transition-opacity z-10"
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
                input.accept = 'video/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onChange({ ...content, url, isLocalFile: true });
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
            placeholder="https://youtube.com/..."
            onBlur={(e) => onChange({ ...content, url: e.target.value })}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
