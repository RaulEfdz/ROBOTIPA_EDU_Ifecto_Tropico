import { COLLECTION_QUIZZES } from "@/app/(dashboard)/(routes)/exams/context/QuizContext";
import { updateQuiz } from "@/app/(dashboard)/(routes)/exams/handler/updateQuiz";
import toast from "react-hot-toast";

export const handleSubmitQuiz = async (
  id: string,
  userId: string,
  score: number,
  userAnswers: { [key: string]: boolean }
) => {
  try {
    const idSplited = id.includes("_&!") ? id.split("_&!")[1] : id;
    const response = await updateQuiz(
      COLLECTION_QUIZZES,
      idSplited,
      "responses",
      {
        userId,
        score,
        answers: userAnswers,
        date: Date.now(),
      }
    );

    return response;
  } catch (error) {
    console.error("Error al enviar respuestas:", error);
    toast.error("Error al enviar las respuestas. Inténtalo de nuevo.");
  }
};
