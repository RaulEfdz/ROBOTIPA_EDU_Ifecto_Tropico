export async function updateQuiz(
  nameCollection: string,
  id: string,
  arrayName: string,
  dataToAdd: any,
  replaceExisting: boolean = false // Variable opcional para indicar si se debe reemplazar
): Promise<any> {
  const config = {
    nameCollection,
    id, // ID del documento a actualizar
    arrayName, // Nombre del array en el documento
    dataToAdd, // Datos que se deben agregar al array
    replaceExisting,
  };
  try {
    const response = await fetch("/api/firebase/updateSingle", {
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
    return result; // Retorna la respuesta de la API
  } catch (error) {
    console.error("Error al actualizar el documento:", error);
    throw error;
  }
}
