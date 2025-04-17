import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId } = await params;
  try {
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        delete: false,
        isPublished: true,
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

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[API_GET_COURSE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
