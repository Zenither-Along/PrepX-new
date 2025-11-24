import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, columnId, context, webSearch } = body;

    // Check for API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
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
    const systemInstruction = `You are a helpful AI assistant. The user is viewing content about: ${JSON.stringify(context).substring(0, 500)}...

Be concise and helpful in your responses.`;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure tools based on webSearch flag
    const tools = [];
    if (webSearch) {
      // @ts-ignore - googleSearch is valid at runtime but types might be missing
      tools.push({ googleSearch: {} });
    }

    // Using gemini-flash-latest as verified in testing
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemInstruction,
      tools: tools.length > 0 ? (tools as any) : undefined
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
      lastMessageLength: lastMessage.content.length
    });

    const chat = model.startChat({
      history: history,
    });

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
