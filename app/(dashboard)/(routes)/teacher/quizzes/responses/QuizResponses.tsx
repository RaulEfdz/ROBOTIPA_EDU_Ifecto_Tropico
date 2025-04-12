"use client";

import React, { useState, useEffect } from "react";
import { useQuizContext } from "../context/QuizContext";
import { Answer, AnswerModel, Question } from "../types";
import QuizResponsesModal from "./QuizResponsesModal";

const QuizResponses: React.FC = () => {
  const { viewQuizResponses, closeModalViewResp, isModalOpenViewResp } = useQuizContext();
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!viewQuizResponses?.responses) {
        setIsLoading(false);
        return;
      }
      try {
        const userIds = viewQuizResponses.responses.map((response) => response.userId);
        const response = await fetch("/api/auth/getUsers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds }),
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        const nameMap: Record<string, string> = {};

        if (userData.success) {
          userData.users.forEach((user: { id: string; fullName: string; emailAddress: string }) => {
            nameMap[user.id] = user.fullName.length > 1 ? user.fullName : user.emailAddress;
          });
        }
        setUserNames(nameMap);
      } catch (error) {
        console.error("Error fetching user names:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserNames();
  }, [viewQuizResponses]);

  const countCorrectAnswers = (answers: AnswerModel, questions: Question[]) => {
    return questions.reduce((count, question) => {
      const userAnswer = answers[question.id];
      return typeof userAnswer === "boolean" && userAnswer === question.correctAnswers ? count + 1 : count;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <QuizResponsesModal
      isOpen={isModalOpenViewResp}
      closeModal={closeModalViewResp}
      selectedAnswer={selectedAnswer}
      setSelectedAnswer={setSelectedAnswer}
      userNames={userNames}
      responses={viewQuizResponses?.responses || []}
      questions={viewQuizResponses?.questions || []}
      countCorrectAnswers={countCorrectAnswers}
    />
  );
};

export default QuizResponses;
