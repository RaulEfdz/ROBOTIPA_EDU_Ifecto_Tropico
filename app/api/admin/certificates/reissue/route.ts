import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUniqueCertificateCode } from "@/lib/certificate-service";
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
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return new NextResponse("Curso no encontrado", { status: 404 });
    }
    const existingCertificate = await db.certificate.findFirst({
      where: { userId, courseId },
    });
    const defaultTemplateVersion =
      process.env.DEFAULT_CERTIFICATE_TEMPLATE_VERSION || "v1.0";
    const institutionName =
      process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma Educativa";
    let certificate;
    if (existingCertificate) {
      // Reemisión: actualizar issuedAt, code y templateVersion
      const newCode = await generateUniqueCertificateCode(courseId, userId);
      certificate = await db.certificate.update({
        where: { id: existingCertificate.id },
        data: {
          issuedAt: new Date(),
          code: newCode,
          data: {
            ...(typeof existingCertificate.data === "object" &&
            existingCertificate.data !== null &&
            !Array.isArray(existingCertificate.data)
              ? existingCertificate.data
              : {}),
            templateVersion: defaultTemplateVersion,
          },
        },
      });
    } else {
      // Creación manual
      const newCode = await generateUniqueCertificateCode(courseId, userId);
      certificate = await db.certificate.create({
        data: {
          userId,
          courseId,
          title: course.title,
          institution: institutionName,
          issuedAt: new Date(),
          code: newCode,
          data: { templateVersion: defaultTemplateVersion },
        },
      });
    }
    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error("[ADMIN_CERTIFICATE_REISSUE]", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
