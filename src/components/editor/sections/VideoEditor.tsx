"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-500">Video</label>
      {content.url ? (
        <div className="relative group/video inline-block">
          <div 
            className="relative rounded-lg border border-gray-200 bg-black overflow-hidden"
            style={{ 
              width: content.width ? `${content.width}px` : '100%',
              height: content.height ? `${content.height}px` : 'auto',
              maxWidth: '100%',
              aspectRatio: '16/9'
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
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;
                const startHeight = e.currentTarget.parentElement?.offsetHeight || 0;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const newWidth = startWidth + (moveEvent.clientX - startX);
                  const newHeight = startHeight + (moveEvent.clientY - startY);
                  
                  onChange({ 
                    ...content, 
                    width: Math.max(200, newWidth),
                    height: Math.max(112, newHeight)
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
            className="absolute top-2 right-2 bg-white opacity-0 group-hover/video:opacity-100 transition-opacity z-10"
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
