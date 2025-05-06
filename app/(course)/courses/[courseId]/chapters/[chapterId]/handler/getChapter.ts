interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

// Define el tipo de respuesta esperada del backend
interface GetChapterResponse {
  chapter: any;
  course: any;
  muxData?: any;
  userProgress?: any;
  purchase?: any;
  nextChapter?: any;
  attachments?: any[];
  isFirstChapter: boolean;
  isPreviousChapterCompleted: boolean;
  previousChapterId?: string;
}

export async function getChapterU(
  data: GetChapterProps
): Promise<GetChapterResponse> {
  try {
    const { userId, courseId, chapterId } = data;

    if (!userId) throw new Error("The 'userId' field is required.");
    if (!courseId) throw new Error("The 'courseId' field is required.");
    if (!chapterId) throw new Error("The 'chapterId' field is required.");

    const url = `/api/courses/${courseId}/chapters/${chapterId}/getChapter`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Error from API: ${response.status} - ${response.statusText}`
      );
    }

    const result = await response.json();
    return result as GetChapterResponse;
  } catch (error: any) {
    console.error("Error al obtener datos del capítulo:", error.message);
    throw new Error(`Validation or Fetch Error: ${error.message}`);
  }
}
