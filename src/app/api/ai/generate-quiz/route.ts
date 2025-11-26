import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

interface GenerateQuizRequest {
  content: string; // The text content to generate quiz from
  topic?: string; // Optional topic if content is sparse
  options?: {
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    type?: 'multiple_choice' | 'true_false' | 'mixed';
  };
}

export async function POST(req: Request) {
  try {
    const body: GenerateQuizRequest = await req.json();
    const { content, topic, options } = body;

    // Validate required fields
    if (!content && !topic) {
      return new Response(
        JSON.stringify({ error: "Content or topic is required" }),
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

    // Build system instruction
    const systemInstruction = buildSystemInstruction(content, topic, options);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction,
      generationConfig: { responseMimeType: "application/json" }
    });

    // Generate content
    const prompt = `Generate a quiz based on the provided content/topic.`;
    const result = await model.generateContent(prompt);
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
    console.error("Generate quiz API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function buildSystemInstruction(
  content: string,
  topic?: string,
  options?: any
): string {
  const numQuestions = options?.numQuestions || 5;
  const difficulty = options?.difficulty || 'medium';
  const type = options?.type || 'mixed';

  return `You are an expert educational content creator. Your goal is to create an engaging and accurate quiz based on the provided learning material.

INPUT CONTEXT:
${topic ? `Topic: ${topic}` : ''}
${content ? `Content to Quiz On:
"""
${content.substring(0, 5000)}
"""` : ''}

PARAMETERS:
- Number of Questions: ${numQuestions}
- Difficulty: ${difficulty}
- Question Types: ${type}

OUTPUT FORMAT (JSON):
{
  "title": "Quiz Title",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "question_text": "The question text",
      "question_type": "multiple_choice" | "true_false",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple_choice
      "correct_answer": "The exact string of the correct option",
      "explanation": "Why this is the correct answer"
    }
  ]
}

REQUIREMENTS:
1. Generate exactly ${numQuestions} questions.
2. Questions should be appropriate for ${difficulty} difficulty level.
3. ${type === 'multiple_choice' ? 'All questions must be multiple choice.' : type === 'true_false' ? 'All questions must be True/False.' : 'Mix multiple choice and True/False questions.'}
4. For multiple choice, provide 4 distinct options.
5. For True/False, options should be ["True", "False"].
6. Ensure the "correct_answer" matches one of the "options" exactly.
7. Provide a helpful "explanation" for the correct answer.
8. Focus on key concepts and understanding, not just trivia.
9. Return ONLY the JSON object.`;
}
