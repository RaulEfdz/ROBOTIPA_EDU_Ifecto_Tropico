"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Answer, AnswerModel, Question } from "../types";
import { ArrowLeft, CheckCircle2, XCircle, User } from "lucide-react";

type QuizForUserProps = {
  responses: Answer[];
  userNames: Record<string, string>;
  questions: Question[];
  countCorrectAnswers: (answers: AnswerModel, questions: Question[]) => number;
};

const QuizForUser: React.FC<QuizForUserProps> = ({
  responses,
  userNames,
  questions,
  countCorrectAnswers,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);

  return (
    <div className="flex flex-col items-center h-full text-xl font-bold">
      {responses.length === 0 ? (
        <p>No hay respuestas disponibles</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses
            .sort((a, b) => b.score - a.score)
            .map((response, index) => (
              <div
                key={`${response.userId}-${index}`}
                onClick={() => setSelectedAnswer(response)}
                className="bg-[#FFFCF8] p-6 rounded-xl border border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer"
              >
                {index === 0 && <span className="text-yellow-400">🏆</span>}
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                  <h4 className="font-medium text-gray-900">
                    {userNames[response.userId] || "Cargando..."}
                  </h4>
                </div>
                <p>
                  <strong>Puntaje:</strong>{" "}
                  {(
                    (100 / questions.length) *
                    countCorrectAnswers(response.answers, questions)
                  ).toFixed(0)}
                  /100
                </p>
              </div>
            ))}
        </div>
      )}
      {/* Modal para mostrar detalles */}
      <Dialog open={!!selectedAnswer} onOpenChange={() => setSelectedAnswer(null)}>
        <DialogContent className="w-full max-w-4xl p-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-6">
            Detalles del usuario
          </DialogTitle>
          {selectedAnswer && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => setSelectedAnswer(null)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a la lista
              </button>
              <div className="bg-[#FFFCF8] p-6 rounded-xl border border-gray-200">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Información</h4>
                  <p>
                    <strong>Nombre:</strong>{" "}
                    {userNames[selectedAnswer.userId] || "Usuario desconocido"}
                  </p>
                  <p>
                    <strong>Puntaje total:</strong>{" "}
                    {((100 / questions.length) *
                      countCorrectAnswers(selectedAnswer.answers, questions)).toFixed(0)}{" "}
                    / 100
                  </p>
                </div>
                <h5 className="text-lg font-semibold text-gray-900">Respuestas:</h5>
                <div className="space-y-4">
                  {questions.map((question) => {
                    const userAnswer = selectedAnswer.answers[question.id];
                    const isCorrect = userAnswer === question.correctAnswers;
                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-gray-900 font-medium">{question.question}</p>
                            <p className="text-sm text-gray-500">
                              Respuesta dada: <strong>{String(userAnswer)}</strong>
                            </p>
                            <p className="text-sm text-gray-500">
                              Respuesta esperada: <strong>{String(question.correctAnswers)}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizForUser;
