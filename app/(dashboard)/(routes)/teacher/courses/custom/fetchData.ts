import { toast } from "sonner";

interface FetchDataParams<T> {
  values?: any;
  courseId?: string;
  path: string;
  callback?: (data: T) => void;
  method?: string;
  finallyFunction?: () => void;
}

export const fetchData = async <T = any>({
  values,
  courseId,
  path,
  callback,
  method = 'PUT',
  finallyFunction,
}: FetchDataParams<T>): Promise<T | undefined> => {
  try {
    const response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar obtener el mensaje de error específico del servidor
      try {
        const errorData = await response.json();
        if (errorData.error || errorData.message) {
          errorMessage = errorData.error || errorData.message;
        }
      } catch {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }

      // Mensajes de error más específicos
      switch (response.status) {
        case 401:
          errorMessage = "No tienes permisos para realizar esta acción";
          break;
        case 403:
          errorMessage = "Acceso denegado";
          break;
        case 404:
          errorMessage = "El recurso no fue encontrado";
          break;
        case 500:
          errorMessage = "Error interno del servidor";
          break;
      }
      
      toast.error(errorMessage);
      return;
    }

    const data: T = await response.json();

    if (callback) {
      callback(data);
    }

    return data;
  } catch (error: any) {
    console.error("Fetch error:", error);
    toast.error("Ocurrió un error al procesar la solicitud");
    return;
  } finally {
    if (typeof finallyFunction === "function") {
      finallyFunction();
    }
  }
};
