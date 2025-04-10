import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const course = await db.course.findUnique({
      where: { id: courseId, userId: user.id, delete: false },
    });

    if (!course) return new NextResponse("Unauthorized", { status: 401 });

    const { list } = await req.json(); // array: [{ id, position }]
    if (!Array.isArray(list)) return new NextResponse("Invalid data", { status: 400 });

    const updatePromises = list.map((item: { id: string; position: number }) =>
      db.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Capítulos reordenados" });
  } catch (error) {
    console.error("[CHAPTER_REORDER]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
