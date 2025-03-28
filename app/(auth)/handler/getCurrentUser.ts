export async function getCurrentUser(): Promise<any> {
    try {
      const response = await fetch("/api/auth/getCurrentUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const result = await response.json();
      return result; // Retorna solo los datos de los quizzes
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      throw error;
    }
  }
  