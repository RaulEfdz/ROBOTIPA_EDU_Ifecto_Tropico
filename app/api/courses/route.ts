import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
) {
  try {
  
    const { title } = await req.json();
  const user = (await getUserDataServerAuth())?.user;
        
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