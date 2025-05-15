import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getCertificateTemplateHtml,
  renderCertificateHtml,
} from "@/lib/certificate-service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return new NextResponse("Código de certificado requerido", {
        status: 400,
      });
    }
    const certificate = await db.certificate.findUnique({
      where: { code },
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        course: { select: { title: true } },
      },
    });
    if (!certificate || !certificate.user || !certificate.course) {
      return new NextResponse("Certificado no encontrado", { status: 404 });
    }
    // Manejo seguro de templateVersion
    let templateVersion =
      process.env.DEFAULT_CERTIFICATE_TEMPLATE_VERSION || "v1.0";
    if (
      certificate.data &&
      typeof certificate.data === "object" &&
      !Array.isArray(certificate.data) &&
      "templateVersion" in certificate.data
    ) {
      templateVersion =
        (certificate.data as { templateVersion?: string }).templateVersion ||
        templateVersion;
    }
    const templateHtml = await getCertificateTemplateHtml(templateVersion);
    if (!templateHtml) {
      return new NextResponse("Plantilla de certificado no encontrada", {
        status: 500,
      });
    }
    const issuedAtFormatted = format(new Date(certificate.issuedAt), "PPP", {
      locale: es,
    });
    const certificateData = {
      fullName: certificate.user.fullName,
      courseTitle: certificate.course.title, // Corregido: ahora toma el título del curso
      issuedAtFormatted,
      certificateCode: certificate.code,
      institutionName: certificate.institution,
      username: certificate.user.username,
      email: certificate.user.email,
    };
    const renderedHtml = renderCertificateHtml(certificateData, templateHtml);
    return new NextResponse(renderedHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[CERTIFICATE_VIEW_GET]", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
