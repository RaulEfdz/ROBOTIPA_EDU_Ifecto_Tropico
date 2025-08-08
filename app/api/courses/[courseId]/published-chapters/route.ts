import { NextResponse, NextRequest } from "next/server";
import { getCourseWithPublishedChapters } from "@/app/(course)/courses/[courseId]/getCourseData";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
    `[API_COURSE_PUBLISHED_CHAPTERS_GET] Iniciando para courseId: ${courseId}`
  );
  try {
    if (!courseId) {
      console.error(
        "[API_COURSE_PUBLISHED_CHAPTERS_GET] Error: Course ID faltante en params."
      );
      return new NextResponse("Course ID missing", { status: 400 });
    }

      `[API_COURSE_PUBLISHED_CHAPTERS_GET] Llamando a getCourseWithPublishedChapters con courseId: ${courseId}`
    );
    const course = await getCourseWithPublishedChapters(courseId);
      "[API_COURSE_PUBLISHED_CHAPTERS_GET] Resultado de getCourseWithPublishedChapters:",
      JSON.stringify(course, null, 2)
    );

    if (!course) {
      console.warn(
        `[API_COURSE_PUBLISHED_CHAPTERS_GET] Curso no encontrado para courseId: ${courseId}`
      );
      return new NextResponse("Course not found", { status: 404 });
    }

    if (!course.chapters || course.chapters.length === 0) {
      console.warn(
        `[API_COURSE_PUBLISHED_CHAPTERS_GET] Curso encontrado pero sin capítulos publicados para courseId: ${courseId}`
      );
    }

      `[API_COURSE_PUBLISHED_CHAPTERS_GET] Devolviendo curso para courseId: ${courseId}`
    );
    return NextResponse.json(course);
  } catch (error: any) {
    console.error("[API_COURSE_PUBLISHED_CHAPTERS_GET] Error Interno:", error);
    return new NextResponse(
      `Internal Server Error: ${error.message || "Unknown error"}`,
      { status: 500 }
    );
  }
}
