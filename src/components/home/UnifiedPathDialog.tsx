"use client";

import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2, Save, Upload, FileText, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathGeneration } from "@/context/PathGenerationContext";

interface UnifiedPathDialogProps {
  // Manual create props
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  // AI generate props
  onPathGenerated?: (pathData: any) => void;
  trigger?: React.ReactNode;
}

export function UnifiedPathDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onCreate,
  isCreating,
  onPathGenerated,
  trigger,
}: UnifiedPathDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");
  
  // AI Generation state
  const [topic, setTopic] = useState("");
  const [numBranches, setNumBranches] = useState("4");
  const [depth, setDepth] = useState<"shallow" | "medium" | "deep">("medium");
  const [audience, setAudience] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const { uploadPdf } = usePathGeneration();

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
      onOpenChange(false);
      // Reset form
      setTopic("");
      setGeneratedData(null);
      setError(null);
    }
  };

  const handleManualCreate = () => {
    onCreate();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a valid PDF file.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('File size must be less than 5MB.');
      return;
    }

    setPdfError(null);
    onOpenChange(false); // Close dialog
    
    // Start upload process
    await uploadPdf(file);
  };

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
      <DialogContent className="max-w-3xl max-h-[85vh] md:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Learning Path</DialogTitle>
          <DialogDescription>
            Create a path manually or let AI generate one for you.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="gap-2">
              <Plus className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <Upload className="h-4 w-4" />
              PDF Upload
            </TabsTrigger>
          </TabsList>

          {/* Manual Create Tab */}
          <TabsContent value="manual" className="flex-1 space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="manual-title">Path Title</Label>
              <Input
                id="manual-title"
                placeholder="e.g., Mastering React Patterns"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualCreate()}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleManualCreate}
                disabled={!title.trim() || isCreating}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCreating ? "Creating..." : "Create Path"}
              </Button>
            </div>
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 mt-4">
            {isGenerating ? (
              // Loading animation
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
                {/* Animated branching visualization */}
                <div className="relative w-48 h-48">
                  {/* Central node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary animate-pulse" />
                  
                  {/* Branch 1 - Top */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/60 animate-[pulse_1.5s_ease-in-out_0.2s_infinite]" />
                  <div className="absolute top-8 left-1/2 w-0.5 h-16 bg-gradient-to-b from-primary/60 to-primary -translate-x-1/2 origin-bottom animate-[scaleY_1.5s_ease-in-out_0.2s_infinite]" style={{ transformOrigin: 'bottom' }} />
                  
                  {/* Branch 2 - Right */}
                  <div className="absolute top-1/2 right-8 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/60 animate-[pulse_1.5s_ease-in-out_0.4s_infinite]" />
                  <div className="absolute top-1/2 right-8 w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 -translate-y-1/2 origin-left animate-[scaleX_1.5s_ease-in-out_0.4s_infinite]" style={{ transformOrigin: 'left' }} />
                  
                  {/* Branch 3 - Bottom */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/60 animate-[pulse_1.5s_ease-in-out_0.6s_infinite]" />
                  <div className="absolute bottom-8 left-1/2 w-0.5 h-16 bg-gradient-to-t from-primary/60 to-primary -translate-x-1/2 origin-top animate-[scaleY_1.5s_ease-in-out_0.6s_infinite]" style={{ transformOrigin: 'top' }} />
                  
                  {/* Branch 4 - Left */}
                  <div className="absolute top-1/2 left-8 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/60 animate-[pulse_1.5s_ease-in-out_0.8s_infinite]" />
                  <div className="absolute top-1/2 left-8 w-16 h-0.5 bg-gradient-to-l from-primary to-primary/60 -translate-y-1/2 origin-right animate-[scaleX_1.5s_ease-in-out_0.8s_infinite]" style={{ transformOrigin: 'right' }} />
                  
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[ping_2s_ease-in-out_infinite]" />
                </div>

                {/* Progress messages */}
                <div className="text-center space-y-2 max-w-md">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <h3 className="text-lg font-semibold">Crafting Your Learning Path</h3>
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Analyzing topic and structuring modules...
                  </p>
                </div>

                {/* Fun facts or tips while waiting */}
                <div className="text-xs text-muted-foreground text-center max-w-sm px-4 animate-fade-in">
                  💡 Tip: You can edit everything after generation
                </div>
              </div>
            ) : !generatedData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">What do you want to learn?</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., Full Stack Web Development, Machine Learning Fundamentals..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branches">Modules</Label>
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
                    <Label htmlFor="depth">Depth</Label>
                    <Select value={depth} onValueChange={(v: any) => setDepth(v)}>
                      <SelectTrigger id="depth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shallow">Overview</SelectItem>
                        <SelectItem value="medium">Balanced</SelectItem>
                        <SelectItem value="deep">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Audience</Label>
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
              <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
                <div className="rounded-lg border border-border bg-muted/50 p-4 shrink-0">
                  <h3 className="text-lg font-semibold">{generatedData.path.title}</h3>
                  <p className="text-sm text-muted-foreground">{generatedData.path.subtitle}</p>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden border border-border rounded-lg">
                  <div className="p-4 space-y-3">
                    {generatedData.branches?.map((branch: any, branchIdx: number) => (
                      <div key={branchIdx} className="space-y-2 border border-border rounded-lg p-3 bg-card">
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
                </div>

                <div className="flex gap-2 shrink-0">
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
          </TabsContent>

          {/* PDF Upload Tab */}
          <TabsContent value="pdf" className="flex-1 space-y-4 mt-4">
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF up to 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {pdfError && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {pdfError}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• The process will continue in the background</p>
                <p>• You can navigate away while it's processing</p>
                <p>• A progress card will appear on the home page</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
