import { NextRequest } from "next/server";
import { getCertificateById } from "@/lib/certificate-service";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const paramsResolved = await params;
  const cert = await getCertificateById(paramsResolved.certificateId);
  if (!cert) {
    return new Response("Not found", { status: 404 });
  }

  // Por ahora, devuelve una imagen estática de ejemplo
  const imagePath = path.join(
    process.cwd(),
    "public",
    "Certificado-de-Participación-Animales.png"
  );
  const imageBuffer = fs.readFileSync(imagePath);

  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
