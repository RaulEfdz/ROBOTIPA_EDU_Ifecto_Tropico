import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request) {
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();
    const trimmed = name?.trim().toLowerCase().replace(/\s+/g, " ");

    if (!trimmed) {
      return new NextResponse("Category name is required", { status: 400 });
    }

    const exists = await db.category.findFirst({
      where: {
        name: {
          equals: trimmed,
          mode: "insensitive",
        },
      },
    });

    if (exists) {
      return NextResponse.json({ success: true, data: exists });
    }

    const created = await db.category.create({
      data: { name: trimmed },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("[CATEGORY_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
