"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { saveGeneratedQuiz } from "@/lib/ai/saveGeneratedQuiz";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";

interface QuizGeneratorDialogProps {
  pathId: string;
  columnId?: string;
  itemId?: string;
  defaultContent?: string;
  defaultTopic?: string;
  onQuizSaved?: (quizId: string) => void;
  trigger?: React.ReactNode;
}

export function QuizGeneratorDialog({
  pathId,
  columnId,
  itemId,
  defaultContent = "",
  defaultTopic = "",
  onQuizSaved,
  trigger
}: QuizGeneratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(defaultTopic);
  const [content, setContent] = useState(defaultContent);
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("mixed");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  
  const supabase = useSupabase();
  const { user } = useUser();

  const handleGenerate = async () => {
    if (!topic && !content) return;
    
    setIsGenerating(true);
    setGeneratedQuiz(null);
    
    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          topic,
          options: {
            numQuestions: parseInt(numQuestions),
            difficulty,
            type
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }
      
      const data = await response.json();
      setGeneratedQuiz(data);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate quiz",
        description: "Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuiz || !user) return;
    
    setIsSaving(true);
    try {
      const quizId = await saveGeneratedQuiz(
        supabase,
        pathId,
        generatedQuiz,
        { columnId, itemId }
      );
      
      setOpen(false);
      if (onQuizSaved) onQuizSaved(quizId);
      
      // Reset state
      setGeneratedQuiz(null);
      if (!defaultTopic) setTopic("");
      
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        variant: "destructive",
        title: "Failed to save quiz",
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            Generate Quiz
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Quiz Generator</DialogTitle>
          <DialogDescription>
            Create a custom quiz to test your knowledge.
          </DialogDescription>
        </DialogHeader>
        
        {!generatedQuiz ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., React Hooks, World War II"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Context Content (Optional)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste text here to generate questions from specific content..."
                className="h-24"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Questions</Label>
                <Select value={numQuestions} onValueChange={setNumQuestions}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{generatedQuiz.title}</h3>
                  <p className="text-sm text-muted-foreground">{generatedQuiz.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="text-xs"
                >
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </Button>
              </div>
              
              <div className="space-y-3">
                {generatedQuiz.questions.map((q: any, i: number) => (
                  <div key={i} className="bg-background p-3 rounded border text-sm">
                    <div className="font-medium mb-2">
                      {i + 1}. {q.question_text}
                    </div>
                    <div className="pl-4 space-y-1 text-muted-foreground">
                      {q.question_type === 'multiple_choice' && q.options?.map((opt: string, j: number) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${showAnswers && opt === q.correct_answer ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={showAnswers && opt === q.correct_answer ? 'text-green-600 font-medium' : ''}>{opt}</span>
                        </div>
                      ))}
                      {q.question_type === 'true_false' && (
                        <div className="flex gap-4">
                          <span className={showAnswers && q.correct_answer === 'True' ? 'text-green-600 font-medium' : ''}>True</span>
                          <span className={showAnswers && q.correct_answer === 'False' ? 'text-green-600 font-medium' : ''}>False</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedQuiz ? (
            <Button 
              onClick={handleGenerate} 
              disabled={(!topic && !content) || isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setGeneratedQuiz(null)}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Quiz
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
