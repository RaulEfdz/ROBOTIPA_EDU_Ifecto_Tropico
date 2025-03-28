import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
  Answer,
  Question,
  Quiz,
} from "@/app/(dashboard)/(routes)/teacher/quizzes/types";
import { formatTimestamp } from "@/utils/formatTextMS";

interface ExpiredQuizResultsProps {
  quizData: any;
  isExpired: boolean;
}

const ExpiredQuizResults: React.FC<ExpiredQuizResultsProps> = ({
  quizData,
  isExpired,
}) => {
  if (!isExpired) return null;


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
            <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-base sm:text-lg text-zinc-600">
              El tiempo para esta evaluación ha terminado
            </p>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-800">
                No se registró respuesta
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-red-600">
                0/100
              </p>
            </div>

            <p className="text-base sm:text-lg font-medium mt-4 text-zinc-600">
              La evaluación ya no está disponible
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-bold tracking-tight text-red-600">
              Quiz cerrado el{" "}
              {formatTimestamp(quizData.closeDate?.timestamp)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpiredQuizResults;
