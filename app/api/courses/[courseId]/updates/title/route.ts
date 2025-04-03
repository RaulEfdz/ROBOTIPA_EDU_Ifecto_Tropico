import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    if (!title || title.trim() === "") {
      return new NextResponse("Bad Request: title is required", {
        status: 400,
      });
    }

    const course = await db.course.findFirst({
      where: {
        id: params.courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    const updatedCourse = await db.course.update({
      where: {
        id: params.courseId,
      },
      data: {
        title: title.trim(),
      },
      select: {
        id: true,
        title: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("[COURSE_UPDATE_TITLE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
