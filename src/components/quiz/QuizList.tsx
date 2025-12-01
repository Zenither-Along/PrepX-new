"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PlayCircle, Loader2, Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { QuizGeneratorDialog } from "./QuizGeneratorDialog";
import { QuizViewer } from "./QuizViewer";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface QuizListProps {
  pathId: string;
  columnId: string;
  itemId?: string;
  contentContext?: string; // Text content for generation context
}

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  created_at: string;
  question_count: number;
}

export function QuizList({ pathId, columnId, itemId, contentContext }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const supabase = useSupabase();

  useEffect(() => {
    fetchQuizzes();
  }, [columnId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, quiz_questions(count)')
        .eq('column_id', columnId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizzes(data.map(q => ({
        ...q,
        question_count: q.quiz_questions[0]?.count || 0
      })));
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuizToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizToDelete);

      if (error) throw error;
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete));
      setIsDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quizzes</h3>
        <QuizGeneratorDialog 
          pathId={pathId}
          columnId={columnId}
          itemId={itemId}
          defaultContent={contentContext}
          onQuizSaved={(id) => {
            fetchQuizzes();
          }}
          trigger={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Quiz
            </Button>
          }
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-2">No quizzes yet</p>
          <p className="text-xs text-muted-foreground">Generate a quiz to test your knowledge of this section.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {quizzes.map(quiz => (
            <Dialog key={quiz.id}>
              <DialogTrigger asChild>
                <div 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{quiz.title}</h4>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{quiz.question_count} Questions</span>
                        <span>•</span>
                        <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(quiz.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{quiz.title}</DialogTitle>
                </DialogHeader>
                <QuizViewer quizId={quiz.id} />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
