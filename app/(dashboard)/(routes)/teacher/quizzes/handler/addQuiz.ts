import { Quiz } from '../types';

export async function AddQuiz(nameCollection: string, quizData: Quiz): Promise<any> {
  try {
    const response = await fetch("/api/firebase/add", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nameCollection,
        data: quizData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding quiz:', error);
    throw error;
  }
}
