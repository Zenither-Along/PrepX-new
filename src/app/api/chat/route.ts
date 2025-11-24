import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Check for jsonMode
    const { messages, columnId, context, webSearch, jsonMode } = body;

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

    // Create a system message with the column context
    let systemInstruction = `You are a helpful AI assistant. The user is viewing content about: ${JSON.stringify(context).substring(0, 500)}...

Be concise and helpful in your responses.`;

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
