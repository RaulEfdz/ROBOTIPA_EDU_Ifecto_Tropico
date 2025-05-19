import { NextResponse } from "next/server";
import { generateCertificate } from "@/lib/certificate-service";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request) {
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id || !["admin", "teacher"].includes((user as any).customRole)) {
      return new NextResponse("No autorizado", { status: 403 });
    }
    const { userId, courseId } = await req.json();
    if (!userId || !courseId) {
      return new NextResponse("userId y courseId son requeridos", {
        status: 400,
      });
    }
    // Usar el servicio refactorizado para emitir o reemitir el certificado
    const cert = await generateCertificate(userId, courseId);
    if (!cert) {
      return new NextResponse("No se pudo emitir el certificado", {
        status: 500,
      });
    }
    return NextResponse.json({
      success: true,
      certificateId: cert.id,
      pdfUrl: cert.pdfUrl,
    });
  } catch (error) {
    console.error("[ADMIN_CERTIFICATE_REISSUE]", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
