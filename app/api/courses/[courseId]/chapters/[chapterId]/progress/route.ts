import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }) {
  try {
    const { chapterId } = await params;
    const { isCompleted } = await req.json();

    const user = (await getUserDataServerAuth())?.user;
        
          if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    } 

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user?.id,
          chapterId: chapterId,
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId:user?.id,
        chapterId: chapterId,
        isCompleted,
      }
    })

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}