"use client";

import { Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
}

export function ContentSection({ 
  id, 
  type, 
  content, 
  onChange, 
  onDelete,
  isSelected = false,
  isEditing = false,
  onSelect,
  onEdit,
}: ContentSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const clickCountRef = useRef(0);

  const handleClick = (e: React.MouseEvent) => {
    // Don't handle clicks on inputs or interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
      return;
    }

    clickCountRef.current += 1;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // Single click - select section
        onSelect?.();
      } else if (clickCountRef.current === 2) {
        // Double click - enter edit mode
        onEdit?.();
      }
      clickCountRef.current = 0;
    }, 250);
  };

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
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            Unsupported section type: {type}
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "group relative flex items-start transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg",
        !isEditing && "cursor-pointer"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!isEditing ? handleClick : undefined}
    >
      <div className="flex-1 rounded-lg p-2 transition-colors hover:bg-muted/50">
        {renderEditor()}
      </div>

      <div className={cn(
        "absolute right-2 top-2 opacity-0 transition-opacity z-10",
        (isHovered || isSelected) && "opacity-100"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
