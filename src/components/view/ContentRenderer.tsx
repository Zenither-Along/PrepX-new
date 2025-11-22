
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
    case "heading":
      return <h2 className="text-2xl font-bold mb-4">{content.text}</h2>;
    case "subheading":
      return <h3 className="text-xl font-semibold mb-3 text-gray-900">{content.text}</h3>;
    case "paragraph":
      return <p className="text-base leading-relaxed mb-4 text-gray-800 whitespace-pre-wrap">{content.text}</p>;
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
            <div className="h-48 w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
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
          className="mb-4 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-black hover:shadow-md group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{content.title || content.url}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{content.url}</p>
          </div>
        </a>
      );
    case "list":
      const isOrdered = content.listType === 'ordered';
      const ListTag = isOrdered ? 'ol' : 'ul';
      
      return (
        <ListTag className={cn("mb-6 space-y-2", isOrdered && "list-decimal pl-5")}>
          {(content.items || []).map((item: string, index: number) => (
            <li key={index} className={cn("text-gray-800 leading-relaxed", !isOrdered && "flex items-start gap-3")}>
              {!isOrdered && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />}
              <span>{item}</span>
            </li>
          ))}
        </ListTag>
      );
    case "code":
      return (
        <div className="mb-6 rounded-xl bg-gray-900 p-6 overflow-x-auto">
          <div className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            {content.language || "Code"}
          </div>
          <pre className="font-mono text-sm text-gray-100 leading-relaxed">
            <code>{content.code}</code>
          </pre>
        </div>
      );
    case "table":
      const tableData = content.data || [["", ""]];
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              {tableData.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, colIndex: number) => (
                    <td 
                      key={colIndex} 
                      className="border border-gray-300 px-4 py-2 text-gray-800"
                    >
                      {cell || <span className="text-gray-400">—</span>}
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
      <h3 
        className="font-semibold text-gray-900 mb-2 flex items-start gap-2 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="mt-1 text-gray-500 hover:text-gray-900 transition-colors">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">Q</span>
        {content.question}
      </h3>
      {isOpen && (
        <div className="pl-14 text-gray-600 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
          {content.answer}
        </div>
      )}
    </div>
  );
}
