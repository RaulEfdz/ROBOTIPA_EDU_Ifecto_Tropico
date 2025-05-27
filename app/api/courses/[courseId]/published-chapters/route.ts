import { NextResponse } from "next/server";
import { getCourseWithPublishedChapters } from "@/app/(course)/courses/[courseId]/getCourseData";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  console.log(
    `[API_COURSE_PUBLISHED_CHAPTERS_GET] Iniciando para courseId: ${params.courseId}`
  );
  try {
    const courseId = params.courseId;
    if (!courseId) {
      console.error(
        "[API_COURSE_PUBLISHED_CHAPTERS_GET] Error: Course ID faltante en params."
      );
      return new NextResponse("Course ID missing", { status: 400 });
    }

    console.log(
      `[API_COURSE_PUBLISHED_CHAPTERS_GET] Llamando a getCourseWithPublishedChapters con courseId: ${courseId}`
    );
    const course = await getCourseWithPublishedChapters(courseId);
    console.log(
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

    console.log(
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
