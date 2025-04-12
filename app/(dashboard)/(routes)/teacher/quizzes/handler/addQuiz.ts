// handler/addQuiz.ts
import { Quiz } from "../types";

export const AddQuiz = async (collection: string, quiz: Quiz): Promise<any> => {
  try {
    const response = await fetch(`/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quiz)
    });
    if (!response.ok) {
      throw new Error("Error al crear quiz");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en handler/addQuiz:", error);
    throw error;
  }
};
