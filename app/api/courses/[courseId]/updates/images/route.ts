import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params:Promise<{ courseId: string }>}
) {
  const { courseId } = await params;
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return new NextResponse("Bad Request: imageUrl is required", {
        status: 400,
      });
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: { imageUrl: imageUrl.trim() },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("[COURSE_UPDATE_IMAGE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
