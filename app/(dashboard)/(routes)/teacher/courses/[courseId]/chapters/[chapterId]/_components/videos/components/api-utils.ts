// src/utils/api-utils.ts
// Funciones para facilitar llamadas a la API

/**
 * Realiza solicitudes API genéricas con manejo de errores y callbacks
 * @param values - Datos a enviar
 * @param courseId - ID del curso (usado para contextualizar logs)
 * @param path - Ruta del endpoint
 * @param method - Método HTTP
 * @param callback - Función a ejecutar tras éxito
 */
export const fetchData = async ({ values, courseId, path, method, callback }: { values: any; courseId: string; path: string; method: string; callback?: () => void }) => {
    try {
      const response = await fetch(path, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) {
        console.error(`API Error for course ${courseId}:`, await response.text());
        throw new Error("API request failed");
      }
  
      const data = await response.json();
      if (callback) callback();
      return data;
    } catch (error) {
      console.error(`Error in fetchData for course ${courseId}:`, error);
      throw error;
    }
  };