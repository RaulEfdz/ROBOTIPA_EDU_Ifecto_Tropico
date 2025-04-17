import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { getCourses } from "@/actions/get-courses";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, categoryId } = body;

    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    const courses = await getCourses({
      userId: user.id,
      title,
      categoryId,
    });

    return NextResponse.json({
      user,
      categories,
      courses,
    });
  } catch (error) {
    console.error("Error in /api/search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
