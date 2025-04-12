// handler/getQuizzes.ts
export const getQuizzes = async (collection: string): Promise<any> => {
  try {
    const response = await fetch(`/api/quizzes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error("Error al obtener quizzes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en handler/getQuizzes:", error);
    throw error;
  }
};
