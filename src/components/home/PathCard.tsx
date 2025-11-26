"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Star, Share2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PathCardProps {
  path: any; // We can refine this type later or import LearningPath
  onDelete: (id: string) => void;
  onEditDescription: (id: string, subtitle: string) => void;
  onSetMajor: (id: string) => void;
  onUnsetMajor: (id: string) => void;
  onPublish: (id: string, currentStatus: boolean) => void;
}

export function PathCard({
  path,
  onDelete,
  onEditDescription,
  onSetMajor,
  onUnsetMajor,
  onPublish
}: PathCardProps) {
  return (
    <Card className={`group relative overflow-hidden border-border bg-card hover:shadow-md transition-shadow h-[155px] flex flex-col ${path.is_major ? 'border-yellow-400 ring-1 ring-yellow-400 bg-yellow-50/10' : ''}`}>
      <CardHeader className="pb-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/path/${path.id}`} className="flex-1 min-w-0">
            <CardTitle className="text-base hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2">
              {path.is_major && <Star className="h-4 w-4 text-yellow-500 shrink-0" />}
              <span className="truncate">{path.title}</span>
            </CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-1">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditDescription(path.id, path.subtitle)}>
                <Pencil className="mr-2 h-4 w-4" />
                Add Description
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/path/${path.id}/edit`} className="flex items-center cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {path.is_major ? (
                <DropdownMenuItem onClick={() => onUnsetMajor(path.id)}>
                  <Star className="mr-2 h-4 w-4 fill-none" />
                  Unset Major
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onSetMajor(path.id)}>
                  <Star className="mr-2 h-4 w-4 text-yellow-500" />
                  Set as Major
                </DropdownMenuItem>
              )}
              {path.original_path_id ? (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <Share2 className="mr-2 h-4 w-4" />
                  Cannot Publish (Clone)
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onPublish(path.id, !!path.is_public)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {path.is_public ? "Unpublish" : "Publish to Community"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(path.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-10">
          {path.subtitle && path.subtitle !== "Add a description" ? path.subtitle : ""}
        </p>
      </CardHeader>
      <CardFooter className="pt-2 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{new Date(path.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
