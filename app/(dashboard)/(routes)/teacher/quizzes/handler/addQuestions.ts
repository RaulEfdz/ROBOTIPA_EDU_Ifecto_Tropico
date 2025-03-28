import { Quiz } from '../types';

export async function addQuestions(updatedQuiz: Quiz): Promise<any> {
  try {
    if (!updatedQuiz.id) {
      throw new Error("Falta el ID del quiz para actualizar");
    }

    const response = await fetch("/api/firebase/add", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nameCollection: 'Quizzes',
        data: updatedQuiz,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
}
