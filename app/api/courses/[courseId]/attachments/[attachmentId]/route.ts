import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

export async function DELETE(
  req: Request,
  { params }: any
) {
  try {
    const user = (await getUserDataServer())?.user;
    
      if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: user?.id,
        delete: false,
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attachment = await db.attachment.delete({
      where: {
        courseId: params.courseId,
        id: params.attachmentId,
      }
    });

    return NextResponse.json(attachment);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

