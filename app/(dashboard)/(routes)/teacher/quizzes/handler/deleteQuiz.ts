export async function deleteQuiz(nameCollection: string, IdQuiz: string): Promise<any> {
    try {
      const response = await fetch("/api/firebase/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nameCollection,
            id: IdQuiz
          }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const result = await response.json();
      return result; // Retorna solo los datos de los quizzes
    } catch (error) {
      console.error("confirm:", error);
      throw error;
    }
  }
  