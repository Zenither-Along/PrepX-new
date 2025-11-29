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
import { RichTextEditor } from "./sections/RichTextEditor";

interface ContentSectionProps {
  id: string;
  type: string;
  content: any;
  onChange: (content: any) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function ContentSection({ 
  id, 
  type, 
  content, 
  onChange, 
  onDelete,
  dragHandleProps,
}: ContentSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderEditor = () => {
    switch (type) {
      case "rich-text":
        return <RichTextEditor content={content} onChange={onChange} />;
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
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            Unsupported section type: {type}
          </div>
        );
    }
  };

  const getSectionLabel = () => {
    switch (type) {
      case "rich-text": return "Rich Text";
      case "heading": return "Heading";
      case "subheading": return "Subheading";
      case "paragraph": return "Paragraph";
      case "image": return "Image";
      case "video": return "Video";
      case "link": return "Link";
      case "list": return "List";
      case "code": return "Code";
      case "qna": return "Q&A";
      case "table": return "Table";
      default: return type;
    }
  };

  return (
    <div 
      className="group relative flex flex-col transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag handle bar */}
      <div 
        {...dragHandleProps}
        className={cn(
          "flex items-center justify-center w-full h-6 rounded-t cursor-grab active:cursor-grabbing transition-colors touch-none",
          "hover:bg-muted/50",
          // Always visible for touch devices, subtle by default
          "bg-transparent" 
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors rotate-90" />
      </div>

      {/* Content editor */}
      <div className="flex-1 rounded-lg px-2 pb-2 transition-colors hover:bg-muted/50">
        {renderEditor()}
      </div>

      {/* Delete button */}
      <div className={cn(
        "absolute right-2 top-1 opacity-0 transition-opacity z-20",
        isHovered && "opacity-100"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-background/80"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
