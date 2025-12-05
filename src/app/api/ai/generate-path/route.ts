import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAndIncrementUsage, createLimitExceededResponse } from "@/lib/usageLimit";

export const maxDuration = 30;

type GenerationMode = 'full' | 'branches' | 'items' | 'content';

interface GeneratePathRequest {
  mode: GenerationMode;
  topic: string;
  context?: {
    pathId?: string;
    pathTitle?: string;
    branchId?: string;
    branchTitle?: string;
    itemId?: string;
    itemTitle?: string;
    existingStructure?: any;
  };
  options?: {
    numBranches?: number;
    numItems?: number;
    numSections?: number;
    depth?: 'shallow' | 'medium' | 'deep';
    audience?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export async function POST(req: Request) {
  try {
    // Check usage limits first
    const usageResult = await checkAndIncrementUsage('content_generation');
    if (usageResult && !usageResult.allowed) {
      return createLimitExceededResponse('content_generation', usageResult);
    }

    const body: GeneratePathRequest = await req.json();
    const { mode, topic, context, options } = body;

    // Validate required fields
    if (!topic || !mode) {
      return new Response(
        JSON.stringify({ error: "Topic and mode are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    // Build system instruction based on mode
    const systemInstruction = buildSystemInstruction(mode, topic, context, options);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction,
      generationConfig: { responseMimeType: "application/json" }
    });

    // Generate content
    const result = await model.generateContent(topic);
    const response = await result.response;
    const text = response.text();

    // Parse and validate response
    let generatedData;
    try {
      generatedData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(generatedData), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Generate path API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function buildSystemInstruction(
  mode: GenerationMode,
  topic: string,
  context?: any,
  options?: any
): string {
  const depth = options?.depth || 'medium';
  const audience = options?.audience || 'intermediate';
  const numBranches = options?.numBranches || 4;
  const numItems = options?.numItems || 5;
  
  // Dynamic section count based on depth if not explicitly provided
  let defaultNumSections = 3;
  if (depth === 'deep') defaultNumSections = 6;
  if (depth === 'shallow') defaultNumSections = 2;
  
  const numSections = options?.numSections || defaultNumSections;

  const baseInstruction = `You are an expert learning path designer. Your goal is to create structured, comprehensive learning content.

Target Audience: ${audience}
Depth Level: ${depth}
`;

  switch (mode) {
    case 'full':
      return `${baseInstruction}

TASK: Generate a complete learning path for the topic: "${topic}"

OUTPUT FORMAT (JSON):
{
  "path": {
    "title": "Main title for the learning path",
    "subtitle": "Brief description of what learner will achieve"
  },
  "branches": [
    {
      "title": "Branch/Module title",
      "items": [
        {
          "title": "Specific topic/subtopic",
          "sections": [
            {
              "type": "rich-text",
              "content": "<h2>Introduction</h2><p>Detailed explanation of the concept...</p>"
            },
            {
              "type": "code",
              "content": "// Code example if relevant"
            },
            {
              "type": "rich-text",
              "content": "<h3>Key Takeaways</h3><ul><li>Point 1</li><li>Point 2</li></ul>"
            }
          ]
        }
      ]
    }
  ]
}

REQUIREMENTS:
- Create ${numBranches} main branches (modules/categories)
- Each branch should have ${numItems} items (topics)
- For each item, generate comprehensive content with approximately ${numSections} sections (adapt based on topic complexity)
- Content types allowed: 
  - "rich-text": Use HTML tags (h2, h3, p, ul, ol, strong, em) for headings, explanations, and lists. Return the HTML as a STRING.
  - "code": For code snippets (use plain text, no markdown backticks).
  - "image": If a visual would help, return {"url": "placeholder-url", "caption": "description"}.
  - "qna": For review questions, return {"question": "...", "answer": "..."}.
- For ${depth} depth: ${depth === 'shallow' ? 'Focus on high-level overview' : depth === 'deep' ? 'Include detailed explanations, examples, and edge cases' : 'Balance overview with practical details'}
- For ${audience} audience: ${audience === 'beginner' ? 'Use simple language, explain basics' : audience === 'advanced' ? 'Use technical terminology, assume prior knowledge' : 'Balance accessibility with depth'}
- Make content actionable and practical
- Include examples where appropriate
- **CRITICAL**: Do NOT repeat the same structure for every item. Vary the content types and order based on what best explains the specific topic.
- **CRITICAL**: Ensure "rich-text" content is a valid HTML string, NOT an object.

Return ONLY the JSON, no additional text.`;

    case 'branches':
      return `${baseInstruction}

TASK: Generate branch structure for an existing learning path.

CONTEXT:
Path Title: ${context?.pathTitle || topic}
${context?.existingStructure ? `Existing Branches: ${JSON.stringify(context.existingStructure)}` : ''}

OUTPUT FORMAT (JSON):
{
  "branches": [
    {
      "title": "Branch/Module title",
      "description": "Brief description of what this branch covers"
    }
  ]
}

REQUIREMENTS:
- Generate ${numBranches} branches that logically organize the topic
- Ensure branches are comprehensive and cover the full scope
- Avoid duplicating existing branches if provided
- Each branch should be a major topic area/module

Return ONLY the JSON, no additional text.`;

    case 'items':
      return `${baseInstruction}

TASK: Generate items (subtopics) for a specific branch.

CONTEXT:
Branch: ${context?.branchTitle || topic}
Path: ${context?.pathTitle || 'N/A'}

OUTPUT FORMAT (JSON):
{
  "items": [
    {
      "title": "Specific topic/subtopic title"
    }
  ]
}

REQUIREMENTS:
- Generate ${numItems} items for this branch
- Items should be specific, actionable topics
- Order items from fundamental to advanced
- Each item should be a discrete learning unit

Return ONLY the JSON, no additional text.`;

    case 'content':
      return `${baseInstruction}

TASK: Generate content sections for a specific topic.

CONTEXT:
Topic: ${context?.itemTitle || topic}
Branch: ${context?.branchTitle || 'N/A'}
Path: ${context?.pathTitle || 'N/A'}

OUTPUT FORMAT (JSON):
{
  "sections": [
    {
      "type": "rich-text" | "code" | "image" | "video" | "link" | "qna",
      "content": "Content here"
    }
  ]
}

SECTION TYPES:
- "rich-text": Use HTML (h2, h3, p, ul, ol) for text content. Combine headings and paragraphs into single rich-text sections where logical.
- "code": Code snippets (plain text).
- "image": {"url": "...", "caption": "..."}
- "video": {"url": "...", "title": "..."}
- "link": {"url": "...", "title": "..."}
- "qna": {"question": "...", "answer": "..."}

REQUIREMENTS:
- Generate approximately ${numSections} content sections (adapt to topic needs)
- Start with a rich-text section introducing the topic
- Use rich-text for explanations, combining headings and paragraphs. Return HTML as a STRING.
- Add code examples for programming topics
- Make content comprehensive yet concise
- Structure content logically (intro -> explanation -> example -> summary)
- **CRITICAL**: Do NOT repeat the same structure for every item. Vary the content types and order based on what best explains the specific topic.
- **CRITICAL**: Ensure "rich-text" content is a valid HTML string, NOT an object.

Return ONLY the JSON, no additional text.`;

    default:
      return baseInstruction;
  }
}
