import { getBlogPost, getAllBlogPosts, formatDate } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  
  if (!post) {
    return {
      title: "Post Not Found | PrepX Blog",
    };
  }

  return {
    title: `${post.title} | PrepX Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo width={140} height={48} />
          </Link>
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <span 
              key={tag}
              className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/logo-icon-light.png"
                alt="PrepX"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/logo-icon-dark.png"
                alt="PrepX"
                fill
                className="object-contain hidden dark:block"
              />
            </div>
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.readTime}</span>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>



        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
          prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800 prose-h2:pb-2
          prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
          prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
          prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
          prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
          prose-code:text-primary prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
          prose-img:rounded-lg prose-img:shadow-lg"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Join thousands of learners and educators using PrepX to create personalized learning experiences.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/">
              <Button size="lg" className="gap-2">
                Try PrepX Free
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline" className="gap-2">
                Read More Articles
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
