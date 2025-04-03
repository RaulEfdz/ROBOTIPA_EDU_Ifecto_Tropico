import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: any
) {
  try {
    
    const { title } = await req.json();

    const user = (await getUserDataServerAuth())?.user;
            
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

    const lastChapter = await db.chapter.findFirst({
      where: {
        delete: false,
        courseId: params.courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await db.chapter.create({
      data: {
        title,
        courseId: params.courseId,
        position: newPosition,
      }
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}