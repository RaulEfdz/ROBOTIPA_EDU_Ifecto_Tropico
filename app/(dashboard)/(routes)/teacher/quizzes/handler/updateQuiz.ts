// handler/updateQuiz.ts
export const updateQuiz = async (
  collection: string,
  quizId: string,
  nameKey: string,
  updateData: any,
  isField: boolean = false
): Promise<any> => {
  try {
    // Construir el cuerpo de la solicitud; si isField es true, se entiende que se actualiza un campo en específico
    const body = isField ? { [nameKey]: updateData } : updateData;
    const response = await fetch(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error("Error al actualizar quiz");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en handler/updateQuiz:", error);
    throw error;
  }
};
