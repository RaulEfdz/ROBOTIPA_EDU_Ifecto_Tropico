import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

export async function POST(
  req: Request,
) {
  try {
  
    const { title } = await req.json();
  const user = (await getUserDataServer())?.user;
        
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.create({
      data: {
        userId:user?.id,
        title,
      }
    });

    return NextResponse.json(course);
  } catch (error) {

    return new NextResponse("Internal Error", { status: 500 });
  }
}