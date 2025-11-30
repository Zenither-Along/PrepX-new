import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export const maxDuration = 60;

// Define schemas for validation (optional but good for type safety)
const structureSchema = z.object({
  title: z.string(),
  description: z.string(),
  branches: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
    })),
  })),
});

const contentSchema = z.object({
  sections: z.array(z.object({
    type: z.enum(['heading', 'paragraph', 'code', 'callout', 'list']),
    content: z.any(),
  })),
});

export async function POST(req: Request) {
  try {
    const { action, text, context } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the same model that works in chat/route.ts
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: "application/json" }
    });

    const generateWithRetry = async (prompt: string, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await model.generateContent(prompt);
        } catch (error: any) {
          if (error.message?.includes('503') || error.status === 503) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            continue;
          }
          throw error;
        }
      }
      throw new Error('Max retries exceeded');
    };

    if (action === 'generate-structure') {
      const prompt = `
        Analyze the following text and create a structured learning path.
        The path should have main branches (topics) and items (sub-topics) within each branch.
        
        Return ONLY valid JSON matching this structure:
        {
          "title": "Course Title",
          "description": "Course Description",
          "branches": [
            {
              "title": "Branch Title",
              "items": [
                { "title": "Item Title", "description": "Optional description" }
              ]
            }
          ]
        }
        
        Text content:
        ${text.substring(0, 100000)}
      `;

      const structureResult = await generateWithRetry(prompt);
      const responseText = structureResult.response.text();
      
      console.log('[Structure] Raw response length:', responseText.length);
      console.log('[Structure] Raw response (first 500 chars):', responseText.substring(0, 500));
      
      // Clean up markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      console.log('[Structure] Cleaned JSON length:', cleanJson.length);
      console.log('[Structure] Cleaned JSON (first 500 chars):', cleanJson.substring(0, 500));
      
      if (!cleanJson) {
        throw new Error('Empty response from Gemini API');
      }
      
      let object;
      try {
        object = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('[Structure] JSON parse failed. Full cleaned JSON:', cleanJson);
        throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
      
      return Response.json(object);
    }

    if (action === 'generate-content') {
      const prompt = `
        Generate educational content for the topic: "${context.itemTitle}".
        Context from the original document:
        ${text.substring(0, 30000)}

        The content should be engaging and formatted for a learning app.
        Use headings, paragraphs, lists, and callouts where appropriate.
        
        Return ONLY valid JSON matching this structure:
        {
          "sections": [
            { "type": "heading", "content": "Section Title" },
            { "type": "paragraph", "content": "Text content..." },
            { "type": "list", "content": ["Item 1", "Item 2"] },
            { "type": "callout", "content": "Important note" },
            { "type": "code", "content": "Code snippet if applicable" }
          ]
        }
      `;

      const contentResult = await generateWithRetry(prompt);
      const responseText = contentResult.response.text();
      
      console.log('[Content] Raw response length:', responseText.length);
      
      // Clean up markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      if (!cleanJson) {
        throw new Error('Empty response from Gemini API');
      }
      
      let object;
      try {
        object = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('[Content] JSON parse failed. Full cleaned JSON:', cleanJson);
        throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      return Response.json(object);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Generation error details:', error);
    return Response.json({ 
      error: 'Failed to generate', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
