"use client";

import { Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HeadingEditor } from "./sections/HeadingEditor";
import { SubheadingEditor } from "./sections/SubheadingEditor";
import { ParagraphEditor } from "./sections/ParagraphEditor";
import { ImageEditor } from "./sections/ImageEditor";
import { VideoEditor } from "./sections/VideoEditor";
import { LinkEditor } from "./sections/LinkEditor";
import { ListEditor } from "./sections/ListEditor";
import { CodeEditor } from "./sections/CodeEditor";
import { QnAEditor } from "./sections/QnAEditor";
import { TableEditor } from "./sections/TableEditor";

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
        return <HeadingEditor content={content} onChange={onChange} />;
      case "subheading":
        return <SubheadingEditor content={content} onChange={onChange} />;
      case "paragraph":
        return <ParagraphEditor content={content} onChange={onChange} />;
      case "image":
        return <ImageEditor content={content} onChange={onChange} />;
      case "video":
        return <VideoEditor content={content} onChange={onChange} />;
      case "link":
        return <LinkEditor content={content} onChange={onChange} />;
      case "list":
        return <ListEditor content={content} onChange={onChange} />;
      case "code":
        return <CodeEditor content={content} onChange={onChange} />;
      case "qna":
        return <QnAEditor content={content} onChange={onChange} />;
      case "table":
        return <TableEditor content={content} onChange={onChange} />;
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
