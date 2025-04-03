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
      const errorMsg = `Error ${response.status}: ${response.statusText}`;
      toast.error(errorMsg);
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
