"use client";

import React from "react";
import { useQuizContext } from "../context/QuizContext";
import { formatTimestamp } from "@/utils/formatTextMS";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock } from "lucide-react";

type QuizForResponsesProps = {
  userNames: Record<string, string>;
};

function QuizForResponses({ userNames }: QuizForResponsesProps) {
  const { quiz } = useQuizContext();

  if (!quiz) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-xl font-semibold text-muted-foreground">
              No hay cuestionario disponible
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
      </Card>

      <ScrollArea className="h-auto">
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <Card key={question.id} className="bg-card" >
              <CardHeader>
                <CardTitle className="text-lg"><label className="font-extralight">{index+1}.{" "}</label>{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {quiz.responses?.map((response, subIndex) => {
                    const answered = response.answers[question.id] !== undefined;
                    const isCorrect = response.answers[question.id];

                    return (
                      <li key={response.userId} className="flex items-center gap-3 border bg-slate-100 p-2">
                        <label className="font-extralight">Resp: {index+1}.{subIndex+1}.{" "}</label>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {formatTimestamp(response.date)}
                        </Badge>
                        <span className="font-medium">
                          {userNames[response.userId] || "Usuario desconocido"}
                        </span>
                        {!answered ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>No respondió</span>
                          </Badge>
                        ) : isCorrect ? (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-green-500 text-white">
                            <Check className="h-3 w-3" />
                            <span>Correcto</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <X className="h-3 w-3" />
                            <span>Incorrecto</span>
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default QuizForResponses;