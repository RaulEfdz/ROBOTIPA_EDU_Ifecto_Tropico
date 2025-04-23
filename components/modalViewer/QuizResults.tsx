import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Answer, Question, Quiz } from "@/app/(dashboard)/(routes)/exams/types";
import { formatTimestamp } from "@/utils/formatTextMS";

interface QuizResultsProps {
  quizData: any;
  userAnswers: Answer[];
  isResponse: boolean;
  isExist: boolean;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quizData,
  userAnswers,
  isResponse,
  isExist,
}) => {
  if (!isResponse) return null;

  const calculateScore = (answers: Answer[], questions: Question[]): number => {
    const correctAnswersCount = questions.reduce((count, question) => {
      const userAnswer = answers.find(
        (a) => a.answers[question.id] !== undefined
      );
      if (
        userAnswer &&
        userAnswer.answers[question.id] === question.correctAnswers
      ) {
        return count + 1;
      }
      return count;
    }, 0);

    // Calcula el puntaje como un porcentaje
    return (100 / questions.length) * correctAnswersCount;
  };

  // Calcula el puntaje del usuario
  const grade = calculateScore(userAnswers, quizData.questions);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 80) return "¡Excelente trabajo!";
    if (score >= 60) return "¡Buen esfuerzo!";
    return "Sigue practicando";
  };

  return (
    <Card className="w-[90vw] max-w-screen-sm mx-auto shadow-lg p-4 sm:p-6 md:p-8">
      <CardHeader className="space-y-4 bg-gradient-to-br from-zinc-50 to-zinc-100 border-b pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-zinc-900 text-center">
          {quizData.title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-zinc-600 text-justify px-2 sm:px-4 md:px-8">
          {quizData.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-base sm:text-lg text-zinc-600">
              ¡Has completado esta evaluación!
            </p>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                Tu puntuación es:
              </p>
              <p
                className={`text-3xl sm:text-4xl font-bold ${getScoreColor(
                  grade
                )}`}
              >
                {grade.toFixed(0)}/100
              </p>
            </div>

            <p className="text-base sm:text-lg font-medium mt-4">
              {getScoreMessage(grade)}
            </p>
          </div>

          {!isExist ? (
            <div className="space-y-1">
              <p className="font-bold tracking-tight text-red-600">
                Quiz cerrado el{" "}
                {formatTimestamp(quizData.quizData.closeDate?.timestamp)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-bold tracking-tight text-green-600">
                Quiz cierra el{" "}
                {formatTimestamp(quizData.quizData.closeDate?.timestamp)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResults;
