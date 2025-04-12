// handler/addQuestions.ts
import { Quiz } from "../types";

export const addQuestions = async (quiz: Quiz): Promise<any> => {
  try {
    // Intentar actualizar el quiz existente
    const putResponse = await fetch(`/api/quizzes/${quiz.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quiz)
    });

    // Si la actualización fue exitosa, se retorna la respuesta
    if (putResponse.ok) {
      return await putResponse.json();
    } 
    // Si el quiz no existe (por ejemplo, status 404), se intenta crearlo
    else if (putResponse.status === 404) {
      const postResponse = await fetch(`/api/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz)
      });
      if (!postResponse.ok) {
        throw new Error("Error al crear el quiz");
      }
      return await postResponse.json();
    } 
    // Si ocurre otro error, se lanza una excepción
    else {
      throw new Error("Error al guardar el quiz: " + putResponse.statusText);
    }
  } catch (error) {
    console.error("Error en addQuestions:", error);
    throw error;
  }
};
