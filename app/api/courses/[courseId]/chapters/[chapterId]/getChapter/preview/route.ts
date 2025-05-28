// File: app/api/courses/[courseId]/chapters/[chapterId]/video/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,

  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const body = await req.json();
    const { isPreview } = body;
    const { courseId, chapterId } = await params;

    // Si no es preview, requerir autenticación
    if (!isPreview) {
      const user = (await getUserDataServerAuth())?.user;
      if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Buscar el capítulo y su video
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { video: true },
    });

    if (!chapter || chapter.delete || !chapter.isPublished) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    return NextResponse.json({
      videoUrl: chapter.video?.url ?? null,
    });
  } catch (error) {
    console.error("[POST_CHAPTER_VIDEO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
