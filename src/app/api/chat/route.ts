import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAndIncrementUsage, createLimitExceededResponse } from "@/lib/usageLimit";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Check usage limits first
    const usageResult = await checkAndIncrementUsage('chat');
    if (usageResult && !usageResult.allowed) {
      return createLimitExceededResponse('chat', usageResult);
    }

    const body = await req.json();
    // Check for jsonMode and teachingMode
    const { messages, columnId, context, webSearch, jsonMode, teachingMode, editingSection } = body;

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

    // Create system instruction based on mode
    let systemInstruction = '';
    
    if (editingSection) {
      // Special mode for editing specific sections
      const sectionTypeInstructions: Record<string, string> = {
        "rich-text": "This is a rich text section. Return the edited content as clean, semantic HTML. Use tags like <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>. Focus on clarity, readability, and proper formatting. Return ONLY the HTML content without explanations.",
        "code": "This is a code section. Return the improved code with better formatting, comments, and best practices. Maintain the same programming language unless explicitly asked to change it. Return ONLY the code without markdown code blocks or explanations.",
        "image": "This is an image section. Suggest a better URL or improve the description for the image. Return a JSON object with 'url' and optionally 'alt' or 'caption' fields.",
        "video": "This is a video section. Suggest a better URL or improve the description for the video. Return a JSON object with 'url' and optionally 'title' or 'description' fields.",
        "link": "This is a link section. Improve the link URL or description. Return a JSON object with 'url' and 'title' fields.",
        "list": "This is a list section. Improve the list items for clarity and completeness. Return the list items as an array.",
        "table": "This is a table section. You MUST return the COMPLETE table data. Do not skip rows or columns. Return ONLY a JSON object in this exact format: { \"data\": [[\"Header 1\", \"Header 2\"], [\"Row 1 Col 1\", \"Row 1 Col 2\"]] } where 'data' is a 2D array of strings representing the entire table. Preserve existing content unless asked to change it. EXAMPLE: If the table has 2 rows and 2 columns, return a 2x2 array.",
        "qna": "This is a Q&A section. Improve the question and answer for clarity and educational value. Return a JSON object with 'question' and 'answer' fields."
      };

      const typeInstruction = sectionTypeInstructions[editingSection.type] || "Edit and improve this content.";

      systemInstruction = `You are an Expert Content Editor for educational materials.

CONTEXT:
You are editing a specific **${editingSection.type}** section.

CURRENT CONTENT:
${JSON.stringify(editingSection.content, null, 2)}

YOUR TASK:
${typeInstruction}

EDITING GUIDELINES:
1. **Preserve Intent**: Keep the core message and purpose of the original content.
2. **Enhance Quality**: Improve clarity, grammar, structure, and educational value.
3. **Be Precise**: Make targeted improvements without unnecessary changes.
4. **Professional Tone**: Maintain an educational, professional tone.
5. **Format Correctly**: Return content in the exact format expected for this section type.

IMPORTANT:
- Return ONLY the edited content in the appropriate format.
- For rich-text: Return clean HTML without markdown code blocks.
- For code: Return the code directly without \`\`\` markers.
- Make substantial improvements while respecting the original intent.
- Be concise and focused on the editing task.`;
    } else if (jsonMode) {
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
        "sectionType": "rich-text" | "code" | "image" | "video" | "table" | "list" | "link" | "qna",
        "content": "Content for the section (HTML for rich-text, code for code sections, URL for image/video/link, array for list, object with question/answer for qna)"
      }
    ]
  }
}

SECTION TYPE GUIDANCE:
- "rich-text": Use for text content with formatting. Provide HTML with semantic tags like <h2>, <h3>, <p>, <ul>, <ol>, <strong>
- "code": Use for code snippets. Provide the code as a string
- "image": Use for images. Provide image URL
- "video": Use for videos. Provide video URL (YouTube, Vimeo, etc.)
- "table": Use for tabular data. Provide as JSON: { "data": [["row1col1", "row1col2"], ["row2col1", "row2col2"]] }
- "list": Use for simple lists. Provide as array of items
- "link": Use for external links. Provide URL and title
- "qna": Use for Q&A sections. Provide object with "question" and "answer" fields

IMPORTANT:
- Return ONLY valid JSON.
- Do not include markdown formatting (like \`\`\`json).
- If creating items, suggest 3-5 relevant items unless specified otherwise.
`;
    } else {
      // Mode-specific system instructions
      const mode = teachingMode || 'default';
      
      const baseContext = `You are an AI Study Buddy helping a student understand content.

CONTENT CONTEXT:
${contextString}

`;

      const modeInstructions = {
        default: `${baseContext}
TEACHING MODE: Normal / Default

Provide direct, clear, and concise answers:
- Be helpful and straight to the point
- Avoid unnecessary complexity or lengthy explanations unless asked
- Use simple formatting (bullet points, short paragraphs) for readability
- If the user asks for code, provide it directly with brief context
- Maintain a friendly but professional tone

Example approach:
Student: "What is a variable?"
You: "A variable is like a container that stores data values. In programming, you use variables to save information (like numbers or text) so you can use or change it later."`,

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

      systemInstruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.default;
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
