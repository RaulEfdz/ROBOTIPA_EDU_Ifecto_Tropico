import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const { certificateId } = await params;
  const cert = await db.certificate.findUnique({
    where: { code: certificateId },
  });

  if (!cert) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(JSON.stringify({ imageUrl: cert.fileUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
