import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const numSections = options?.numSections || 3;

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
              "type": "heading",
              "content": "Section title"
            },
            {
              "type": "paragraph",
              "content": "Detailed explanation text"
            },
            {
              "type": "code",
              "content": "// Code example if relevant"
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
- Each item should have ${numSections} content sections
- Content types: heading, paragraph, code (for programming topics), list
- For ${depth} depth: ${depth === 'shallow' ? 'Focus on high-level overview' : depth === 'deep' ? 'Include detailed explanations and examples' : 'Balance overview with practical details'}
- For ${audience} audience: ${audience === 'beginner' ? 'Use simple language, explain basics' : audience === 'advanced' ? 'Use technical terminology, assume prior knowledge' : 'Balance accessibility with depth'}
- Make content actionable and practical
- Include examples where appropriate

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
      "type": "heading" | "paragraph" | "code" | "list",
      "content": "Content here"
    }
  ]
}

SECTION TYPES:
- heading: Section title or subheading
- paragraph: Text explanation
- code: Code examples (use appropriate syntax)
- list: Bullet points or numbered lists (use JSON array)

REQUIREMENTS:
- Generate ${numSections} content sections
- Start with a heading that introduces the topic
- Include clear explanations
- Add code examples for programming topics
- Make content comprehensive yet concise
- Structure content logically (intro -> explanation -> example -> summary)

Return ONLY the JSON, no additional text.`;

    default:
      return baseInstruction;
  }
}
