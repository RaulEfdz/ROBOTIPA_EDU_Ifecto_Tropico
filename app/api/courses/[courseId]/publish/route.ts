import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request, { params }: any) {
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseId = await params.courseId;

    if (!courseId) {
      return new NextResponse("Bad Request: courseId is required", {
        status: 400,
      });
    }

    // Verify if the course belongs to the user
    const course = await db.course.findFirst({
      where: {
        isPublished: false,
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the 'isPublished' field to true
    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
