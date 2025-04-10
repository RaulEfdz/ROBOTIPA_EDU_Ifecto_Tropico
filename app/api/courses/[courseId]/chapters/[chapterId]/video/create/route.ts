import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Mux from "@mux/mux-node";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

const { Video: MuxVideo } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }>}
) {
  const { courseId, chapterId } = await params;

  try {
    const { uploadId } = await req.json();

    if (!uploadId) {
      return new NextResponse("Upload ID is missing", { status: 400 });
    }

    const userData = await getUserDataServerAuth();
    const user = userData?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verificar que el curso pertenece al usuario
    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: user.id,
        delete: false,
      },
    });
    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verificar la existencia del capítulo y obtener, si existe, su video asociado
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { video: true },
    });
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Obtener los datos del upload desde Mux
    const upload = await MuxVideo.Uploads.get(uploadId);
    if (!upload || !upload.asset_id) {
      return NextResponse.json(
        { message: "El asset aún no está disponible en Mux." },
        { status: 400 }
      );
    }

    // Si ya existe un video asociado al capítulo, se puede eliminar el asset anterior en Mux
    if (chapter.video?.assetId) {
      await MuxVideo.Assets.del(chapter.video.assetId);
    }

    // Obtener información detallada del asset en Mux
    const asset = await MuxVideo.Assets.get(upload.asset_id);

    // Usar upsert para actualizar el registro si ya existe o crearlo de nuevo.
    const videoRecord = await db.video.upsert({
      where: { chapterId: chapter.id },
      update: {
        url:
          asset.playback_ids?.[0]?.policy === "public"
            ? `https://stream.mux.com/${asset.playback_ids[0].id}.m3u8`
            : "",
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0].id,
        type: "mux",
        duration: asset.duration ?? null,
        resolution: asset.resolution_tier ?? null,
        aspectRatio: asset.aspect_ratio ?? null,
        status: asset.status ?? null,
      },
      create: {
        chapterId: chapter.id,
        url:
          asset.playback_ids?.[0]?.policy === "public"
            ? `https://stream.mux.com/${asset.playback_ids[0].id}.m3u8`
            : "",
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0].id,
        type: "mux",
        duration: asset.duration ?? null,
        resolution: asset.resolution_tier ?? null,
        aspectRatio: asset.aspect_ratio ?? null,
        status: asset.status ?? null,
      },
    });

    return NextResponse.json(videoRecord);
  } catch (error) {
    console.error("[VIDEO_CREATE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
