import toast from "react-hot-toast";

interface FetchDataParams {
  values?: any; // Reemplaza 'any' con un tipo más específico según tus necesidades
  courseId?: string;
  path: string;
	callback?: any; // Reemplaza 'any' con el tipo de datos esperado
  method?: string;
  finallyFunction?: any
}

export const fetchData = async ({ values, courseId, path, callback, method='PUT', finallyFunction }: FetchDataParams): Promise<void> => {
 
  try {


    const response = await fetch(path, {
      method: method? method : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorMsg = `HTTP error! Status: ${response.status}`;
      // console.error(errorMsg);
      toast.error(errorMsg);
      return; // Exit the function if the response is not OK.
    }

    const data = await response.json();

    if (callback) {
      callback(data);
    }

    return data;
  } catch (error:any) {
    console.error('Fetch error:', error);
    toast.error("Ocurrió un error");
    return error
  } finally {
    if (typeof finallyFunction === 'function') {
      finallyFunction();
    } else {
    }
  }
};
