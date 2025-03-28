export async function getQuizzes(nameCollection: string): Promise<any> {
    try {
      const response = await fetch("/api/firebase/getAll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nameCollection,
          }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const result = await response.json();
      return result.result; // Retorna solo los datos de los quizzes
    } catch (error) {
      console.error("Error al obtener quizzes:", error);
      throw error;
    }
  }
  