"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Quiz } from "../types";
import { AddQuiz } from "../handler/addQuiz";
import { getQuizzes } from "../handler/getQuizzes";
import { deleteQuiz } from "../handler/deleteQuiz";
import { updateQuiz } from "../handler/updateQuiz";
import toast from "react-hot-toast";

interface QuizContextType {
  quizzes: Quiz[];
  quiz: Quiz | null;
  viewQuizResponses: Quiz | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  setQuiz: (quiz: Quiz | null) => void;
  setViewQuizResponses: (quiz: Quiz | null) => void;
  createNewQuiz: (quiz: Quiz) => Promise<void>;
  deleteAQuiz: (quizId: string) => Promise<void>;
  refreshQuizzes: () => Promise<void>;
  isModalOpenViewResp: boolean;
  openModalViewResp: () => void;
  closeModalViewResp: () => void;
  SetCloseDate: (timestamp: number, currentQuiz: Quiz) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

export const COLLECTION_QUIZZES = "Quizzes";

// Función para obtener todos los quizzes con manejo de error
export const getAllQuizzes = async (setQuizzes: (quizzes: Quiz[]) => void) => {
  let toastId;
  try {
    toastId = toast.loading("Loading quizzes...");
    const data = await getQuizzes(COLLECTION_QUIZZES);
    if (!Array.isArray(data)) {
      toast.dismiss(toastId);
      throw new Error("Invalid data format");
    }
    setQuizzes(data);
    toast.dismiss(toastId);
    toast.success("Quizzes loaded successfully!", { id: toastId });
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Error loading quizzes: ${errorMessage}`, { id: toastId });
    console.error("Error in getAllQuizzes:", error);
    return [];
  } finally {
    toast.dismiss(toastId);
  }
};

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [viewQuizResponses, setViewQuizResponses] = useState<Quiz | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenViewResp, setIsModalOpenViewResp] = useState(false);

  const refreshQuizzes = async () => {
    try {
      await getAllQuizzes(setQuizzes);
    } catch (error) {
      console.error("Error refreshing quizzes:", error);
    }
  };

  const deleteAQuiz = async (quizId: string) => {
    const toastId = toast.loading("Deleting quiz...");
    try {
      const response = await deleteQuiz(COLLECTION_QUIZZES, quizId);
      if (response.confirm) {
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
        if (quiz?.id === quizId) setQuiz(null);
        if (viewQuizResponses?.id === quizId) setViewQuizResponses(null);
        toast.success("Quiz deleted successfully", { id: toastId });
        await refreshQuizzes();
      } else {
        toast.error("Failed to delete quiz", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Error deleting quiz", { id: toastId });
    }
  };

  const createNewQuiz = async (newQuiz: Quiz) => {
    const toastId = toast.loading("Creating quiz...");
    try {
      await AddQuiz(COLLECTION_QUIZZES, newQuiz);
      toast.dismiss(toastId);
      await refreshQuizzes();
      toast.success("Quiz created successfully!", { id: toastId });
      closeModal();
    } catch (error) {
      toast.error("Error creating quiz. Please try again.", { id: toastId });
      throw error;
    }
  };

  const SetCloseDate = async (timestamp: number, currentQuiz: Quiz) => {
    const toastId = toast.loading("Programando quiz...");
    try {
      const nameKey = "closeDate";
      const result = await updateQuiz(COLLECTION_QUIZZES, currentQuiz.id, nameKey, { timestamp }, true);
      if (result) {
        await refreshQuizzes();
      }
      toast.dismiss(toastId);
    } catch (error) {
      toast.error("Error creating quiz. Please try again.", { id: toastId });
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    refreshQuizzes();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openModalViewResp = () => setIsModalOpenViewResp(true);
  const closeModalViewResp = () => setIsModalOpenViewResp(false);

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        setQuizzes,
        quiz,
        setQuiz,
        viewQuizResponses,
        setViewQuizResponses,
        createNewQuiz,
        isModalOpen,
        openModal,
        closeModal,
        deleteAQuiz,
        refreshQuizzes,
        isModalOpenViewResp,
        openModalViewResp,
        closeModalViewResp,
        SetCloseDate,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
