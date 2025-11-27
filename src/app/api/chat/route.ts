import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Check for jsonMode and teachingMode
    const { messages, columnId, context, webSearch, jsonMode, teachingMode } = body;

    // Check for API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("API Key present:", !!apiKey);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to .env.local" }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages must be an array", received: typeof messages }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build context string from content sections
    const contextString = context?.sections 
      ? context.sections.map((s: any) => `${s.type}: ${s.content}`).join('\n\n')
      : JSON.stringify(context).substring(0, 500);

    // Create system instruction based on teaching mode
    let systemInstruction = '';
    
    if (jsonMode) {
      systemInstruction = `You are an AI assistant for a learning path editor.
Your goal is to help the user create content by generating a structured JSON plan.

CONTEXT:
The user is currently viewing: ${JSON.stringify(context)}

INSTRUCTIONS:
1. Analyze the user's request and the current context.
2. If the user wants to create items or sections, generate a JSON object with an "actions" array.
3. If the user is just asking a question, answer normally (but still return valid JSON with a "message" field).

JSON SCHEMA:
{
  "message": "A brief explanation of what you did or an answer to the question.",
  "plan": {
    "actions": [
      {
        "type": "create_item",
        "title": "Title of the item"
      },
      {
        "type": "create_section",
        "sectionType": "heading" | "paragraph" | "code" | "image" | "video",
        "content": "Content for the section (or code snippet)"
      }
    ]
  }
}

IMPORTANT:
- Return ONLY valid JSON.
- Do not include markdown formatting (like \`\`\`json).
- If creating items, suggest 3-5 relevant items unless specified otherwise.
`;
    } else {
      // Mode-specific system instructions
      const mode = teachingMode || 'socratic';
      
      const baseContext = `You are an AI Study Buddy helping a student understand content.

CONTENT CONTEXT:
${contextString}

`;

      const modeInstructions = {
        socratic: `${baseContext}
TEACHING MODE: Socratic Method

Use the Socratic method to guide learning. Instead of directly explaining concepts:
- Ask thought-provoking questions to help the student discover answers themselves
- Encourage critical thinking by breaking down complex ideas into simpler questions
- Use follow-up questions to deepen understanding
- Only provide direct explanations when the student is stuck or explicitly requests it
- Be encouraging and patient in your questioning approach

Example approach:
Student: "What is machine learning?"
You: "Great question! Let's think about it together. Have you ever noticed how you get better at something the more you practice it? How do you think that might relate to computers?"`,

        eli5: `${baseContext}
TEACHING MODE: Explain Like I'm 5 (ELI5)

Explain concepts as if teaching someone with no background knowledge:
- Use very simple, everyday language
- Avoid technical jargon entirely, or explain it with analogies
- Use relatable comparisons and examples from daily life
- Break complex ideas into small, digestible pieces
- Use storytelling when possible to make concepts memorable
- Be encouraging and make learning feel fun and accessible

Example approach:
"Think of it like a recipe for making cookies. Just like a recipe tells you step-by-step what to do to make cookies, code tells a computer step-by-step what to do to solve a problem!"`,

        expert: `${baseContext}
TEACHING MODE: Expert/Technical

Provide detailed, technical explanations for advanced learners:
- Use industry-standard terminology and technical vocabulary
- Assume the student has foundational knowledge in the subject
- Go deep into implementation details, edge cases, and nuances
- Reference best practices, design patterns, and architectural considerations
- Discuss trade-offs, performance implications, and real-world applications
- Be precise and thorough in your explanations

Example approach:
"This utilizes a lazy evaluation strategy with memoization to optimize the recursive call stack, reducing time complexity from O(2^n) to O(n) through dynamic programming..."`,

        quiz: `${baseContext}
TEACHING MODE: Quiz Me

Act as an interactive quiz instructor:
- Generate practice questions based on the content the student is viewing
- Ask one question at a time, wait for their answer
- When they answer, provide immediate feedback:
  - If correct: Confirm and explain why it's correct
  - If incorrect: Gently correct and explain the right answer
- If they say "hint" or "help", provide a helpful clue without giving away the answer
- Keep track of their progress and adjust question difficulty accordingly
- Be encouraging regardless of whether they get it right or wrong
- After several questions, summarize their performance

Example approach:
"Let's test your understanding! Here's your first question: [question]"
[Student answers]
"Excellent! That's correct. The reason is... [explanation]"

Or if they need help: "Good try! Here's a hint: Think about... [clue]"`
      };

      systemInstruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.socratic;
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure tools based on webSearch flag
    const tools = [];
    if (webSearch && !jsonMode) {
      // @ts-ignore - googleSearch is valid at runtime but types might be missing
      tools.push({ googleSearch: {} });
    }

    // Using gemini-flash-latest as verified in testing
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemInstruction,
      tools: tools.length > 0 ? (tools as any) : undefined,
      generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
    });

    // Convert messages to Gemini format
    // Gemini expects history + last message. 
    // However, the chat endpoint usually receives the full history including the last user message.
    // We need to parse this.
    
    // Simple conversion:
    // The last message is the prompt. The rest is history.
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    console.log("Starting chat with Gemini...", {
      historyLength: history.length,
      lastMessageLength: lastMessage.content.length,
      jsonMode
    });

    const chat = model.startChat({
      history: history,
    });

    if (jsonMode) {
      try {
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();
        
        return new Response(text, {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (jsonError: any) {
        console.error("JSON Mode Error:", jsonError);
        // Fallback or rethrow with more info
        throw new Error(`JSON Mode failed: ${jsonError.message}`);
      }
    }

    const result = await chat.sendMessageStream(lastMessage.content);
    
    // Create a ReadableStream from the Gemini stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
