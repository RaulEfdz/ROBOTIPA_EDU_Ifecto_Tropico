export async function getQuiz(nameCollection: string, id: string): Promise<any> {
    const config = {
        nameCollection,
        id, // Incluye el ID del documento
      }
    try {
      const response = await fetch("/api/firebase/getSingle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const result = await response.json();
      return result.result; // Retorna solo el documento específico
    } catch (error) {
      console.error("Error al obtener el quiz:", error);
      throw error;
    }
  }
  