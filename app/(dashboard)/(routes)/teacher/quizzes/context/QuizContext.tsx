"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Quiz } from "../types";
import { AddQuiz } from "../handler/addQuiz";
import { getQuizzes } from "../handler/getQuizzes";
import { deleteQuiz } from "../handler/deleteQuiz";
import toast from "react-hot-toast";
import { updateQuiz } from "../handler/updateQuiz";

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
  refreshQuizzes: () => Promise<void>; // New function to refresh quizzes

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

// Function to fetch quizzes with proper error handling
// Function to fetch quizzes with proper error handling
export const getAllQuizzes = async (setQuizzes: (quizzes: Quiz[]) => void) => {
  let toastId;

  try {
    // Llamada al servicio para obtener los quizzes
    toastId = toast.loading("Loading quizzes...");
    const data = await getQuizzes(COLLECTION_QUIZZES);

    if (!Array.isArray(data)) {
      toast.dismiss(toastId); // Cierra el `toast` automáticamente
      throw new Error("Invalid data format");
    }

    setQuizzes(data); // Actualiza el estado con los datos
    toast.dismiss(toastId); // Cierra el `toast` automáticamente
    toast.success("Quizzes loaded successfully!", { id: toastId });
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    toast.error(`Error loading quizzes: ${errorMessage}`, { id: toastId });
    console.error("Error in getAllQuizzes:", error);
    return []; // Devuelve un array vacío para evitar errores aguas abajo
  } finally {
    toast.dismiss(toastId); // Cierra el `toast` automáticamente
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
      await getAllQuizzes(setQuizzes); // Llama y espera la función asíncrona
    } catch (error) {
      console.error("Error refreshing quizzes:", error);
    }
  };

  const deleteAQuiz = async (quizId: string) => {
    const toastId = toast.loading("Deleting quiz...");
    try {
      const response = await deleteQuiz(COLLECTION_QUIZZES, quizId);

      if (response.confirm) {
        setQuizzes((prevQuizzes) =>
          prevQuizzes.filter((quiz) => quiz.id !== quizId)
        );

        // Clean up related states
        if (quiz?.id === quizId) setQuiz(null);
        if (viewQuizResponses?.id === quizId) setViewQuizResponses(null);

        toast.success("Quiz deleted successfully", { id: toastId });

        // Refresh the quiz list to ensure synchronization
        await refreshQuizzes();
      } else {
        toast.error("Failed to delete quiz", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Error deleting quiz", { id: toastId });
    }
  };

  // Create new quiz with automatic refresh
  const createNewQuiz = async (newQuiz: Quiz) => {
    const toastId = toast.loading("Creating quiz...");
    try {
      const result = await AddQuiz(COLLECTION_QUIZZES, newQuiz);
      toast.dismiss(toastId);

      // Refresh the quiz list instead of manually updating state
      await refreshQuizzes();

      toast.success("Quiz created successfully!", { id: toastId });
      closeModal();
    } catch (error) {
      toast.error("Error creating quiz. Please try again.", { id: toastId });
      throw error;
    }
  };

  const SetCloseDate = async (timestamp: number, currentQuiz: Quiz) => {
    const toastId = toast.loading("Progrmando quiz...");
    try {
      const nameKey = "closeDate";
      const result = await updateQuiz(
        COLLECTION_QUIZZES,
        currentQuiz.id,
        nameKey,
        { timestamp },
        true
      );
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

  // Load initial quizzes
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
