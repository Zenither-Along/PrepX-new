"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function ImageEditor({ content, onChange }: ImageEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-500">Image</label>
      {content.url ? (
        <div className="relative group/image inline-block">
          <div 
            className="relative rounded-lg border border-gray-200 bg-white overflow-hidden"
            style={{ 
              width: content.width ? `${content.width}px` : 'auto',
              height: content.height ? `${content.height}px` : 'auto',
              maxWidth: '100%'
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
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;
                const startHeight = e.currentTarget.parentElement?.offsetHeight || 0;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const newWidth = startWidth + (moveEvent.clientX - startX);
                  const newHeight = startHeight + (moveEvent.clientY - startY);
                  
                  onChange({ 
                    ...content, 
                    width: Math.max(100, newWidth),
                    height: Math.max(100, newHeight)
                  });
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br bg-blue-500/50" />
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2 bg-white opacity-0 group-hover/image:opacity-100 transition-opacity"
            onClick={() => onChange({ ...content, url: "", width: undefined, height: undefined })}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
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
