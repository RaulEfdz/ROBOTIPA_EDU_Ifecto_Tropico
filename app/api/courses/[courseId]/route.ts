// app/api/courses/[courseId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  if (!courseId) {
    return new NextResponse("Bad Request: courseId is required", {
      status: 400,
    });
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        chapters: { orderBy: { position: "asc" } },
      },
    });

    if (!course) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (err) {
    console.error("[COURSE_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
