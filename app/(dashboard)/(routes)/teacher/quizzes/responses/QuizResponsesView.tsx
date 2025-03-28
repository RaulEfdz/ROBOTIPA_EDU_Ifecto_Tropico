"use client";

import React, { useState } from "react";
import QuizResponses from "./QuizResponses";
import QuizNavbar from "./QuizNavbar";
import { AnswerModel, Question, Answer } from "../types";
import QuizForUser from "./QuizForUser";
import QuizForResponses from "./QuizForResponses";


type QuizResponsesViewProps = {
  selectedAnswer: Answer | null;
  setSelectedAnswer: (answer: Answer | null) => void;
  userNames: Record<string, string>;
  responses: Answer[];
  questions: Question[];
  countCorrectAnswers: (answers: AnswerModel, questions: Question[]) => number;
};

function QuizResponsesView({
  selectedAnswer,
  setSelectedAnswer,
  userNames,
  responses,
  questions,
  countCorrectAnswers,
}: QuizResponsesViewProps) {
  const [currentView, setCurrentView] = useState<"QuizForResponses" | "QuizForUser">("QuizForUser");

  return (
    <div className="flex flex-col h-screen">
      <QuizNavbar setCurrentView={setCurrentView} />
      <div className="p-4 h-[100%] max-h-[85%] overflow-auto">
        {currentView === "QuizForUser" ? (
          <QuizForUser
            responses={responses}
            userNames={userNames}
            questions={questions}
            countCorrectAnswers={countCorrectAnswers}
            // setSelectedAnswer={setSelectedAnswer} // <-- Ahora se pasa correctamente
          />
        ) : (
          <QuizForResponses userNames={userNames}/>
        )}
      </div>
    </div>
  );
}

export default QuizResponsesView;
