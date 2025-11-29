"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ContentSectionProps {
  type: string;
  content: any;
}

export function ContentRenderer({ type, content }: ContentSectionProps) {
  switch (type) {
    case "rich-text":
      return (
        <div 
          className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: content.html || "" }}
        />
      );
    case "heading":
      return <h2 className="text-2xl font-bold mb-4">{content.text}</h2>;
    case "subheading":
      return <h3 className="text-xl font-semibold mb-3 text-foreground">{content.text}</h3>;
    case "paragraph":
      return <p className="text-base leading-relaxed mb-4 text-muted-foreground whitespace-pre-wrap">{content.text}</p>;
    case "image":
      return (
        <div className="my-6">
          {content.url ? (
            <img 
              src={content.url} 
              alt="Content" 
              className="rounded-lg object-contain"
              style={{
                width: content.width ? `${content.width}px` : 'auto',
                height: content.height ? `${content.height}px` : 'auto',
                maxWidth: '100%',
                maxHeight: '500px'
              }}
            />
          ) : (
            <div className="h-48 w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              No image URL
            </div>
          )}
        </div>
      );
    case "video":
      const getEmbedUrl = (url: string) => {
        if (!url) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
          ? `https://www.youtube.com/embed/${match[2]}`
          : url;
      };
      
      return (
        <div className="mb-6">
          {content.url ? (
            <div 
              className="relative rounded-xl bg-black overflow-hidden shadow-sm"
              style={{
                width: content.width ? `${content.width}px` : '100%',
                height: content.height ? `${content.height}px` : 'auto',
                maxWidth: '100%',
                aspectRatio: content.width && content.height ? 'auto' : '16/9'
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
            </div>
          ) : null}
        </div>
      );
    case "link":
      return (
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{content.title || content.url}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{content.url}</p>
          </div>
        </a>
      );
    case "list":
      const isOrdered = content.listType === 'ordered';
      const ListTag = isOrdered ? 'ol' : 'ul';
      
      return (
        <ListTag className={cn("mb-6 space-y-2", isOrdered && "list-decimal pl-5")}>
          {(content.items || []).map((item: string, index: number) => (
            <li key={index} className={cn("text-foreground leading-relaxed", !isOrdered && "flex items-start gap-3")}>
              {!isOrdered && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />}
              <span>{item}</span>
            </li>
          ))}
        </ListTag>
      );
    case "code":
      return (
        <div className="mb-6 rounded-xl bg-muted p-6 overflow-x-auto">
          <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {content.language || "Code"}
          </div>
          <pre className="font-mono text-sm text-foreground leading-relaxed">
            <code>{content.code}</code>
          </pre>
        </div>
      );
    case "table":
      const tableData = content.data || [["", ""]];
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <tbody>
              {tableData.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, colIndex: number) => (
                    <td 
                      key={colIndex} 
                      className="border border-border px-4 py-2 text-foreground"
                    >
                      {cell || <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "qna":
      return <QnARenderer content={content} />;
    default:
      return null;
  }
}

function QnARenderer({ content }: { content: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-6 p-2">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="font-semibold text-foreground mb-2 flex items-start gap-2 cursor-pointer select-none"
      >
        <div className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">Q</span>
        <span>{content.question}</span>
      </div>
      
      {isOpen && (
        <div className="pl-14 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
          {content.answer}
        </div>
      )}
    </div>
  );
}
