import { SupabaseClient } from "@supabase/supabase-js";

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

interface QuizData {
  title: string;
  description?: string;
  questions: Question[];
}

export async function saveGeneratedQuiz(
  supabase: SupabaseClient,
  pathId: string,
  quizData: QuizData,
  context?: {
    columnId?: string;
    itemId?: string;
  }
) {
  try {
    // 1. Create the quiz entry
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        path_id: pathId,
        column_id: context?.columnId,
        item_id: context?.itemId,
        title: quizData.title,
        description: quizData.description
      })
      .select()
      .single();

    if (quizError) throw quizError;
    if (!quiz) throw new Error("Failed to create quiz");

    // 2. Create the questions
    const questionsToInsert = quizData.questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      options: q.options ? JSON.stringify(q.options) : null,
      explanation: q.explanation,
      order_index: index
    }));

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert);

    if (questionsError) throw questionsError;

    return quiz.id;

  } catch (error) {
    console.error("Error saving generated quiz:", error);
    throw error;
  }
}
