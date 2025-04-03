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

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: user.id,
        delete: false,
      },
      select: {
        isPublished: true,
      },
    });
    
     console.log("--------------- xxx x xxx x------------------: ", course)


    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json({ isPublished: course.isPublished });
  } catch (error) {
    console.error("[COURSE_PUBLISH_STATUS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
