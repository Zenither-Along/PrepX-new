
"use client";

import { cn } from "@/lib/utils";

interface ContentSectionProps {
  type: string;
  content: any;
}

export function ContentRenderer({ type, content }: ContentSectionProps) {
  switch (type) {
    case "heading":
      return <h2 className="text-2xl font-bold mb-4">{content.text}</h2>;
    case "paragraph":
      return <p className="text-base leading-relaxed mb-4 text-gray-800 whitespace-pre-wrap">{content.text}</p>;
    case "image":
      return (
        <div className="mb-6">
          {content.url ? (
            <img src={content.url} alt="Content" className="rounded-lg max-h-[500px] w-auto" />
          ) : (
            <div className="h-48 w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              No image URL
            </div>
          )}
        </div>
      );
    case "video":
      return (
        <div className="mb-6">
          {content.url ? (
            <div className="relative aspect-video w-full max-w-3xl rounded-xl bg-black overflow-hidden shadow-sm">
              <iframe 
                src={content.url.replace("watch?v=", "embed/")} 
                className="w-full h-full" 
                allowFullScreen 
              />
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
      return (
        <ul className="mb-6 space-y-2">
          {(content.items || []).map((item: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
              <span className="text-gray-800 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
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
    case "qna":
      return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">Q</span>
            {content.question}
          </h3>
          <div className="pl-8 text-gray-600 leading-relaxed">
            {content.answer}
          </div>
        </div>
      );
    default:
      return null;
  }
}
