// app/(course)/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: {
      delete: false,
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course || course.chapters.length === 0) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const firstChapterId = course.chapters[0].id;
  return NextResponse.redirect(new URL(`/courses/${course.id}/chapters/${firstChapterId}`, req.url));
}
