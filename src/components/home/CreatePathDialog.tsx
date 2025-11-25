"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  trigger?: React.ReactNode;
}

export function CreatePathDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onCreate,
  isCreating,
  trigger
}: CreatePathDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Path
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Path</DialogTitle>
          <DialogDescription>
            Give your learning path a clear and descriptive title.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Mastering React Patterns"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={onCreate} 
            disabled={!title.trim() || isCreating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isCreating ? "Creating..." : "Create Path"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
