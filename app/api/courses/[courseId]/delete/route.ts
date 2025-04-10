import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  try {
  const session = await getUserDataServerAuth();
    const user = session?.user;
          if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }


    if (!courseId) {
      return new NextResponse("Bad Request: chapterId is required", {
        status: 400,
      });
    }

    // Verify if the chapter belongs to a course owned by the user
    const course = await db.course.findFirst({
      where: {
        delete: false,
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the 'delete' field to true
    const updatedcourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        delete: true,
      },
    });

    return NextResponse.json(updatedcourse);
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
