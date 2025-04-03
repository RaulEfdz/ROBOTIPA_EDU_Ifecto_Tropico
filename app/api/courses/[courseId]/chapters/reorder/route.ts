import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function PUT(
  req: Request,
  { params }: any
) {
  try {
       const user = (await getUserDataServerAuth())?.user;

        
          if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list, courseId } = await req.json();

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        delete: false,
        userId: user?.id
      }
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    for (let item of list) {
      await db.chapter.update({
        where: { id: item.id, delete: false,        },
        data: { position: item.position }
      });
    }

    // return new NextResponse("Success", { status: 200 });
    // return new NextResponse()
    return NextResponse.json(ownCourse);
  } catch (error) {
    console.error("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}