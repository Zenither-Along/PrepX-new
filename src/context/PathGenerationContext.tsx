'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/useSupabase';


interface GenerationJob {
  pathId: string;
  status: 'generating' | 'ready' | 'error';
  progress: number;
  message: string;
}

interface PathGenerationContextType {
  uploadPdf: (file: File) => Promise<void>;
  jobs: Record<string, GenerationJob>;
}

const PathGenerationContext = createContext<PathGenerationContextType | undefined>(undefined);

export function PathGenerationProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const { user } = useUser();
  const [jobs, setJobs] = useState<Record<string, GenerationJob>>({});

  // Poll for jobs that are in 'generating' state on mount (in case of refresh)
  useEffect(() => {
    if (!user) return;

    const fetchActiveJobs = async () => {
      const { data } = await supabase
        .from('learning_paths')
        .select('id, status, generation_progress, generation_step')
        .eq('user_id', user.id)
        .eq('status', 'generating');

      if (data) {
        const newJobs: Record<string, GenerationJob> = {};
        data.forEach((path: any) => {
          newJobs[path.id] = {
            pathId: path.id,
            status: path.status,
            progress: path.generation_progress || 0,
            message: path.generation_step || 'Resuming...',
          };
        });
        setJobs(newJobs);
      }
    };

    fetchActiveJobs();
  }, [user, supabase]);

  const updateJob = useCallback((pathId: string, updates: Partial<GenerationJob>) => {
    setJobs((prev) => ({
      ...prev,
      [pathId]: { ...prev[pathId], ...updates },
    }));

    // Sync with DB (debounced or immediate)
    if (updates.progress !== undefined || updates.message !== undefined || updates.status !== undefined) {
      supabase
        .from('learning_paths')
        .update({
          status: updates.status,
          generation_progress: updates.progress,
          generation_step: updates.message,
        })
        .eq('id', pathId)
        .then(({ error }: { error: any }) => {
          if (error) console.error('Failed to update job status', error);
        });
    }
  }, [supabase]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    // Dynamically import pdfjs-dist to avoid SSR issues (DOMMatrix not defined)
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    // Use unpkg as it's more reliable for specific npm versions
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: { str: string } | any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const processPdf = async (pathId: string, file: File) => {
    try {
      // 1. Extract Text
      updateJob(pathId, { progress: 10, message: 'Extracting text from PDF...' });
      const text = await extractTextFromPdf(file);

      // 2. Generate Structure
      updateJob(pathId, { progress: 30, message: 'Analyzing structure...' });
      const structureRes = await fetch('/api/generate-path', {
        method: 'POST',
        body: JSON.stringify({ action: 'generate-structure', text }),
      });
      
      if (!structureRes.ok) {
        const errorData = await structureRes.json().catch(() => ({}));
        console.error('Structure generation failed:', structureRes.status, structureRes.statusText, errorData);
        throw new Error(`Failed to generate structure: ${errorData.details || structureRes.statusText}`);
      }
      const structure = await structureRes.json();

      // Update path title/description
      await supabase
        .from('learning_paths')
        .update({ title: structure.title, subtitle: structure.description })
        .eq('id', pathId);

      // 3. Create Structure (using columns/column_items schema)
      updateJob(pathId, { progress: 50, message: 'Creating learning path structure...' });
      
      // Create root branch column (Syllabus)
      const { data: rootColumnData, error: rootColumnError } = await supabase
        .from("columns")
        .insert({
          path_id: pathId,
          title: "Syllabus",
          type: 'branch',
          order_index: 0,
          parent_item_id: null,
        })
        .select()
        .single();

      if (rootColumnError || !rootColumnData) {
        throw new Error(`Failed to create root column: ${rootColumnError?.message}`);
      }

      let totalItems = 0;
      const itemsToProcess: { id: string; title: string }[] = [];

      for (const [mIndex, module] of structure.branches.entries()) {
        // Create module item in root branch
        const { data: moduleItemData, error: moduleItemError } = await supabase
          .from("column_items")
          .insert({
            column_id: rootColumnData.id,
            title: module.title,
            order_index: mIndex,
          })
          .select()
          .single();

        if (moduleItemError || !moduleItemData) continue;

        // Create sub-branch for topics
        const { data: topicsBranchData, error: topicsBranchError } = await supabase
          .from("columns")
          .insert({
            path_id: pathId,
            parent_item_id: moduleItemData.id,
            title: module.title,
            type: 'branch',
            order_index: 0,
          })
          .select()
          .single();

        if (topicsBranchError || !topicsBranchData) continue;

        for (const [tIndex, topic] of module.items.entries()) {
          // Create topic item
          const { data: topicItemData, error: topicItemError } = await supabase
            .from("column_items")
            .insert({
              column_id: topicsBranchData.id,
              title: topic.title,
              order_index: tIndex,
            })
            .select()
            .single();

          if (topicItemError || !topicItemData) continue;

          itemsToProcess.push({ id: topicItemData.id, title: topic.title });
        }
      }

      totalItems = itemsToProcess.length;

      // 4. Generate Content for each item
      for (let i = 0; i < totalItems; i++) {
        const item = itemsToProcess[i];
        const currentProgress = 50 + Math.floor((i / totalItems) * 40); // 50% to 90%
        
        updateJob(pathId, { 
          progress: currentProgress, 
          message: `Generating content for: ${item.title}` 
        });

        const contentRes = await fetch('/api/generate-path', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'generate-content', 
            text, 
            context: { itemTitle: item.title } 
          }),
        });

        if (contentRes.ok) {
          const contentData = await contentRes.json();
          
          // Create content column for this topic
          const { data: contentColumnData, error: contentColumnError } = await supabase
            .from("columns")
            .insert({
              path_id: pathId,
              parent_item_id: item.id,
              title: item.title,
              type: 'content',
              order_index: 0,
            })
            .select()
            .single();

          if (contentColumnError || !contentColumnData) {
            console.error("Failed to create content column", contentColumnError);
            continue;
          }
          
          // Insert content sections
          const sections = contentData.sections.map((section: { type: string; content: any }, idx: number) => {
            let contentToSave = section.content;
            // Format content based on type if needed (similar to saveGeneratedPath.ts)
            if (section.type === "heading" || section.type === "paragraph") {
              contentToSave = { text: section.content };
            } else if (section.type === "code") {
              contentToSave = { code: section.content, language: "javascript" };
            } else if (section.type === "list") {
              contentToSave = { items: Array.isArray(section.content) ? section.content : [section.content] };
            } else {
              contentToSave = { text: section.content };
            }

            return {
              column_id: contentColumnData.id, // Use column_id, not item_id
              type: section.type,
              content: contentToSave,
              order_index: idx
            };
          });

          const { error: sectionsError } = await supabase.from('content_sections').insert(sections);
          if (sectionsError) console.error("Failed to insert sections", sectionsError);
        }
      }

      // 5. Finalize
      updateJob(pathId, { progress: 100, message: 'Finalizing...', status: 'ready' });

    } catch (error) {
      console.error('Processing error:', error);
      updateJob(pathId, { status: 'error', message: 'Failed to process PDF' });
    }
  };

  const uploadPdf = async (file: File) => {
    if (!user) return;

    // Create initial path record
    const { data: path, error } = await supabase
      .from('learning_paths')
      .insert({
        user_id: user.id,
        title: 'Processing PDF...',
        status: 'generating',
        generation_progress: 0,
        generation_step: 'Starting...',
      })
      .select()
      .single();

    if (error || !path) {
      console.error('Failed to create path:', JSON.stringify(error, null, 2));
      return;
    }

    // Initialize job in state
    setJobs((prev) => ({
      ...prev,
      [path.id]: {
        pathId: path.id,
        status: 'generating',
        progress: 0,
        message: 'Starting...',
      },
    }));

    // Start processing (fire and forget from UI perspective, but tracked in context)
    processPdf(path.id, file);
  };

  return (
    <PathGenerationContext.Provider value={{ uploadPdf, jobs }}>
      {children}
    </PathGenerationContext.Provider>
  );
}

export function usePathGeneration() {
  const context = useContext(PathGenerationContext);
  if (context === undefined) {
    throw new Error('usePathGeneration must be used within a PathGenerationProvider');
  }
  return context;
}
