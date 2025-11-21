"use client";

import { Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  id: string;
  type: string;
  content: any;
  onChange: (content: any) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function ContentSection({ id, type, content, onChange, onDelete, dragHandleProps }: ContentSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderEditor = () => {
    switch (type) {
      case "heading":
        return (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Heading</label>
            <Input
              value={content.text || ""}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0 h-auto py-1"
              placeholder="Enter heading"
            />
          </div>
        );
      case "subheading":
        return (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Sub-heading</label>
            <Input
              value={content.text || ""}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              className="text-lg font-semibold border-b-2 border-blue-200 rounded-none shadow-none px-0 focus-visible:ring-0 focus-visible:border-blue-400 h-auto py-2"
              placeholder="Enter sub-heading"
            />
          </div>
        );
      case "paragraph":
        return (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Paragraph</label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              className="min-h-[80px] resize-none border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-200 text-base leading-relaxed p-3"
              placeholder="Type your paragraph here..."
              rows={3}
            />
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Image</label>
            {content.url ? (
              <div className="relative rounded-lg border border-gray-200 p-2 bg-white">
                <img src={content.url} alt="Content" className="max-h-64 mx-auto rounded-md" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-4 right-4 bg-white"
                  onClick={() => onChange({ ...content, url: "" })}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-sm">
                    Choose file
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm">
                    <span className="flex items-center gap-1">
                      🔗 URL
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm">
                    Upload
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
      case "video":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Video url ( youtube )</label>
            {content.url ? (
              <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-gray-200">
                <iframe 
                  src={content.url.replace("watch?v=", "embed/")} 
                  className="w-full h-full" 
                  allowFullScreen 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 bg-white"
                  onClick={() => onChange({ ...content, url: "" })}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Input
                type="text"
                placeholder="https://youtube.com/..."
                onBlur={(e) => onChange({ ...content, url: e.target.value })}
                className="border-gray-200"
              />
            )}
          </div>
        );
      case "link":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Link Text</label>
            <div className="space-y-2">
              <Input
                placeholder="Link Title"
                value={content.title || ""}
                onChange={(e) => onChange({ ...content, title: e.target.value })}
                className="border-gray-200"
              />
              <div className="flex items-center gap-2">
                <a 
                  href={content.url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                >
                  {content.url || "https://"}
                </a>
              </div>
            </div>
          </div>
        );
      case "list":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">List</label>
            <div className="space-y-1">
              {(content.items || []).map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(content.items || [])];
                      newItems[index] = e.target.value;
                      onChange({ ...content, items: newItems });
                    }}
                    className="border-none shadow-none px-0 focus-visible:ring-0 h-auto py-1 text-sm"
                    placeholder="List item"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => {
                      const newItems = content.items.filter((_: any, i: number) => i !== index);
                      onChange({ ...content, items: newItems });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <button
                className="text-sm text-gray-500 hover:text-gray-700 pl-4"
                onClick={() => onChange({ ...content, items: [...(content.items || []), ""] })}
              >
                + Add item
              </button>
            </div>
          </div>
        );
      case "code":
        return (
          <div className="rounded-lg bg-gray-900 p-4">
            <div className="mb-2 flex justify-between">
              <Input
                value={content.language || "javascript"}
                onChange={(e) => onChange({ ...content, language: e.target.value })}
                className="w-32 border-none bg-transparent text-xs text-gray-400 focus-visible:ring-0"
                placeholder="Language"
              />
            </div>
            <Textarea
              value={content.code || ""}
              onChange={(e) => onChange({ ...content, code: e.target.value })}
              className="font-mono text-sm text-gray-100 bg-transparent border-none focus-visible:ring-0 p-0 min-h-[100px]"
              placeholder="// Type your code here..."
            />
          </div>
        );
      case "qna":
        return (
          <div className="space-y-3 rounded-lg border border-gray-200 p-4 bg-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">●</span>
                <label className="text-sm font-semibold text-gray-700">Question?</label>
              </div>
              <Input
                value={content.question || ""}
                onChange={(e) => onChange({ ...content, question: e.target.value })}
                className="border-gray-200 text-sm"
                placeholder="Enter question"
              />
            </div>
            <div className="space-y-1 ml-6">
              <div className="flex items-center gap-2">
                <span className="text-sm">^</span>
                <label className="text-sm font-medium text-gray-600">Ans.</label>
              </div>
              <Textarea
                value={content.answer || ""}
                onChange={(e) => onChange({ ...content, answer: e.target.value })}
                className="min-h-[60px] border-gray-200 text-sm"
                placeholder="Enter answer"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
            Unsupported section type: {type}
          </div>
        );
    }
  };

  return (
    <div 
      className="group relative flex items-start space-x-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "mt-2 cursor-grab text-gray-300 opacity-0 transition-opacity hover:text-gray-600",
          isHovered && "opacity-100"
        )}
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 rounded-lg p-2 transition-colors hover:bg-gray-50/50">
        {renderEditor()}
      </div>

      <div className={cn(
        "absolute -right-8 top-2 opacity-0 transition-opacity",
        isHovered && "opacity-100"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-600"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
