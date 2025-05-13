// app/api/courses/[courseId]/withProgress/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;
  if (!courseId) {
    return new NextResponse("Bad Request: courseId is required", {
      status: 400,
    });
  }

  const user = await getCurrentUserFromDBServer();
  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const course = await db.course.findUnique({
      where: { delete: false, id: courseId },
      include: {
        chapters: {
          where: { isPublished: true },
          include: { userProgress: { where: { userId: user.id } } },
          orderBy: { position: "asc" },
        },
      },
    });
    if (!course) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const progressCount = await getProgress(user.id, course.id);
    return NextResponse.json({ course, progressCount });
  } catch (err) {
    console.error("[COURSE_WITH_PROGRESS_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
