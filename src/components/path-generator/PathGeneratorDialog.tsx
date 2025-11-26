"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PathGeneratorDialogProps {
  trigger?: React.ReactNode;
  onPathGenerated?: (pathData: any) => void;
}

export function PathGeneratorDialog({
  trigger,
  onPathGenerated,
}: PathGeneratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [numBranches, setNumBranches] = useState("4");
  const [depth, setDepth] = useState<"shallow" | "medium" | "deep">("medium");
  const [audience, setAudience] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    try {
      const response = await fetch("/api/ai/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full",
          topic,
          options: {
            numBranches: parseInt(numBranches),
            depth,
            audience,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate path");
      }

      const data = await response.json();
      setGeneratedData(data);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate path");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedData && onPathGenerated) {
      onPathGenerated(generatedData);
      setOpen(false);
      // Reset form
      setTopic("");
      setGeneratedData(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Path Generator
          </DialogTitle>
          <DialogDescription>
            Generate a complete learning path structure using AI. You can edit everything after generation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {!generatedData ? (
            // Input form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">What do you want to learn?</Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., Full Stack Web Development, Machine Learning Fundamentals, Digital Marketing..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branches">Number of Modules</Label>
                  <Select value={numBranches} onValueChange={setNumBranches}>
                    <SelectTrigger id="branches">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 modules</SelectItem>
                      <SelectItem value="4">4 modules</SelectItem>
                      <SelectItem value="5">5 modules</SelectItem>
                      <SelectItem value="6">6 modules</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth">Depth Level</Label>
                  <Select value={depth} onValueChange={(v: any) => setDepth(v)}>
                    <SelectTrigger id="depth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shallow">Shallow (Overview)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="deep">Deep (Detailed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
                    <SelectTrigger id="audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Learning Path
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Preview generated path
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="text-lg font-semibold">{generatedData.path.title}</h3>
                <p className="text-sm text-muted-foreground">{generatedData.path.subtitle}</p>
              </div>

              <ScrollArea className="flex-1 rounded-lg border border-border">
                <div className="p-4 space-y-4">
                  {generatedData.branches?.map((branch: any, branchIdx: number) => (
                    <div key={branchIdx} className="space-y-2">
                      <div className="font-semibold text-primary">
                        {branchIdx + 1}. {branch.title}
                      </div>
                      <div className="ml-4 space-y-1">
                        {branch.items?.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="text-sm">
                            <span className="text-muted-foreground">
                              {branchIdx + 1}.{itemIdx + 1}
                            </span>{" "}
                            {item.title}
                            {item.sections && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({item.sections.length} sections)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setGeneratedData(null);
                    setError(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Generate Again
                </Button>
                <Button onClick={handleSave} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save as New Path
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
