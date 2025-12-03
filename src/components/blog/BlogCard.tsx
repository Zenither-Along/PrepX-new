"use client";

import Link from "next/link";
import { BlogPost, formatDate } from "@/lib/blog";
import { Calendar, Clock } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* No image fallback */}
        {!post.coverImage && (
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-6xl font-bold text-primary/20">
              {post.title.charAt(0)}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
