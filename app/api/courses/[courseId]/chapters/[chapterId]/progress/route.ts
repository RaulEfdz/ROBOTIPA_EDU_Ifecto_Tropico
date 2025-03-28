import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

export async function PUT(
  req: Request,
  { params }: any
) {
  try {
    const { isCompleted } = await req.json();

    const user = (await getUserDataServer())?.user;
        
          if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    } 

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user?.id,
          chapterId: params.chapterId,
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId:user?.id,
        chapterId: params.chapterId,
        isCompleted,
      }
    })

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}