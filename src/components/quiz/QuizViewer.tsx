"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { useUser } from "@clerk/nextjs";

interface QuizViewerProps {
  quizId: string;
  onComplete?: (score: number, total: number) => void;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[] | null;
  correct_answer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export function QuizViewer({ quizId, onComplete }: QuizViewerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Parse options JSON
      const parsedQuestions = questionsData.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options as unknown as string) : null
      }));

      setQuiz({ ...quizData, questions: parsedQuestions });
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    if (isSubmitted || !quiz) return;
    const questionId = quiz.questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (!quiz || !user) return;
    
    setIsSaving(true);
    
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setIsSubmitted(true);
    
    try {
      // Save attempt
      await supabase.from('quiz_attempts').insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score: correctCount,
        total_questions: quiz.questions.length,
        answers: answers
      });
      
      if (onComplete) onComplete(correctCount, quiz.questions.length);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center p-8">Quiz not found</div>;
  }

  if (isSubmitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="space-y-6">
        <Card className="text-center py-8">
          <CardHeader>
            <div className="mx-auto bg-yellow-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {score} / {quiz.questions.length}
            </div>
            <p className="text-muted-foreground">
              You scored {percentage}%
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={resetQuiz} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Review Answers</h3>
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct_answer;
            
            return (
              <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-medium">
                      {index + 1}. {q.question_text}
                    </CardTitle>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">Your Answer:</span>
                      <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {userAnswer || 'Skipped'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">Correct Answer:</span>
                        <span className="text-green-600">{q.correct_answer}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded text-muted-foreground mt-2">
                    <span className="font-medium text-foreground">Explanation: </span>
                    {q.explanation}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {quiz.title}
          </span>
        </div>
        <CardTitle className="text-lg">
          {currentQuestion.question_text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={answers[currentQuestion.id] || ""}
          onValueChange={handleAnswer}
          className="space-y-3"
        >
          {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options?.map((option) => (
            <div key={option} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
              <Label htmlFor={`${currentQuestion.id}-${option}`} className="grow cursor-pointer font-normal">
                {option}
              </Label>
            </div>
          ))}
          
          {currentQuestion.question_type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              {['True', 'False'].map((option) => (
                <div key={option} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                  <Label htmlFor={`${currentQuestion.id}-${option}`} className="grow cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLastQuestion ? (
            "Submit Quiz"
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
