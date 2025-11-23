import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, columnId, context } = body;

    // Check for API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
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
    const systemMessage = `You are a helpful AI assistant. The user is viewing content about: ${JSON.stringify(context).substring(0, 200)}...

Be concise and helpful in your responses.`;

    // Convert messages to the format expected by the AI SDK
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    console.log("About to call streamText with:", {
      hasApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      apiKeyStart: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10),
      messageCount: formattedMessages.length,
      systemMessageLength: systemMessage.length
    });
   
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemMessage,
      messages: formattedMessages,
    });

    console.log("streamText result received");
    
    // Get detailed response info
    try {
      const response = await result.response;
      console.log("Gemini response:", JSON.stringify(response, null, 2));
      
      return new Response(
        JSON.stringify({ 
          debug: {
            timestamp: new Date().toISOString(),
            responseKeys: Object.keys(response),
          },
          message: "Gemini returned empty response. Common issues:\n1. Free tier quota exhausted - check https://aistudio.google.com/app/apikey\n2. Safety filters - try a simpler message\n3. Invalid/inactive API key - create a new one"
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (e: any) {
      return new Response(
        JSON.stringify({ 
          error: e.message,
          suggestion: "Check your API key at https://aistudio.google.com/app/apikey and create a new one if needed"
        }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Convert the async iterator to a ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`[DEBUG] API Key exists: ${!!process.env.GOOGLE_GENERATIVE_AI_API_KEY}\n`));
          controller.enqueue(encoder.encode(`[DEBUG] Starting to iterate over textStream...\n`));
          
          let chunkCount = 0;
          for await (const chunk of result.textStream) {
            chunkCount++;
            console.log(`Chunk ${chunkCount}:`, chunk);
            controller.enqueue(encoder.encode(chunk));
          }
          
          controller.enqueue(encoder.encode(`\n[DEBUG] Stream complete. Total chunks: ${chunkCount}\n`));
          console.log(`Stream complete. Total chunks: ${chunkCount}`);
          controller.close();
        } catch (error: any) {
          console.error("Stream error:", error);
          controller.enqueue(encoder.encode(`\n[ERROR] ${error.message}\n${error.stack}`));
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
        stack: error.stack,
        type: error.constructor.name
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
