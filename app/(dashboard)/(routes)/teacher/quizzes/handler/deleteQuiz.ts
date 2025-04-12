// handler/deleteQuiz.ts
export const deleteQuiz = async (collection: string, quizId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error("Error al eliminar quiz");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en handler/deleteQuiz:", error);
    throw error;
  }
};
