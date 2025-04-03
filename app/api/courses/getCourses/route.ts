import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        delete: false,
      },
      include: {
        chapters: { orderBy: { position: "asc" } },
        attachments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ course, categories });
  } catch (error) {
    console.error("[API_GET_COURSE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
