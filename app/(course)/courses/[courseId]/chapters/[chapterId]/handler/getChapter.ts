interface GetChapterProps {
    userId: string;
    courseId: string;
    chapterId: string;
  }
  
  export async function getChapterU(data: GetChapterProps): Promise<GetChapterProps> {
    try {
      const { userId, courseId, chapterId } = data;
  
      // Validación de campos obligatorios
      if (!userId) {
        throw new Error("The 'userId' field is required.");
      }
  
      if (!courseId) {
        throw new Error("The 'courseId' field is required.");
      }
  
      if (!chapterId) {
        throw new Error("The 'chapterId' field is required.");
      }
  
      const url = `/api/courses/${courseId}/chapters/${chapterId}/getChapter`;
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Envía el body con los datos completos
      });
  
      if (!response.ok) {
        throw new Error(`Error from API: ${response.status} - ${response.statusText}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Error al obtener datos del capítulo:", error.message);
      throw new Error(`Validation or Fetch Error: ${error.message}`);
    }
  }
  