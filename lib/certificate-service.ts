import { format } from "date-fns";
import { db } from "./db";
import type {
  Certificate as CertificateModel,
  User,
  Course,
} from "@prisma/client";

/**
 * Genera un código de certificado único basado en usuario y curso.
 */
export async function generateUniqueCertificateCode(
  courseId: string,
  userId: string
): Promise<string> {
  const separator = process.env.CERTIFICATE_CODE_SEPARATOR || "-";
  const datePart = format(new Date(), "yyyyMMddHHmmss");
  const cIdPart =
    courseId.length > 4
      ? courseId.substring(0, 4).toUpperCase()
      : courseId.toUpperCase();
  const uIdPart =
    userId.length > 4
      ? userId.substring(0, 4).toUpperCase()
      : userId.toUpperCase();
  return `CERT${separator}${cIdPart}${separator}${uIdPart}${separator}${datePart}`;
}

/**
 * Genera un certificado para un usuario y curso si no existe.
 * Devuelve el registro plano del certificado (sin relaciones anidadas).
 */
export async function generateCertificate(
  userId: string,
  courseId: string
): Promise<CertificateModel | null> {
  // 1) Verificar existencia de usuario y curso
  const [user, course] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.course.findUnique({ where: { id: courseId } }),
  ]);
  if (!user || !course) return null;

  // 2) Buscar certificado existente
  const existing = await db.certificate.findFirst({
    where: { userId, courseId },
  });
  if (existing) {
    return existing;
  }

  // 3) Generar código y metadatos
  const code = await generateUniqueCertificateCode(courseId, userId);
  const templateVersion =
    process.env.DEFAULT_CERTIFICATE_TEMPLATE_VERSION || "v1.0";
  const institution =
    process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma Educativa";

  // 4) Crear nuevo certificado
  const cert = await db.certificate.create({
    data: {
      userId,
      courseId,
      title: course.title,
      institution,
      issuedAt: new Date(),
      code,
      data: { templateVersion },
    },
  });

  return cert;
}

export function getCertificateTemplateHtml(templateVersion?: string): string {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f0f0; }
        .certificate-container { width: 800px; height: 560px; border: 10px solid #78C2AD; background-color: white; padding: 40px; text-align: center; box-shadow: 0 0 15px rgba(0,0,0,0.2); position: relative; }
        .header { font-size: 32px; font-weight: bold; color: #333; margin-bottom: 20px; }
        .presented-to { font-size: 18px; color: #555; margin-bottom: 10px; }
        .student-name { font-size: 28px; font-weight: bold; color: #2a7a64; margin-bottom: 30px; border-bottom: 2px solid #78C2AD; display: inline-block; padding-bottom: 5px; }
        .description { font-size: 16px; color: #555; margin-bottom: 20px; line-height: 1.6; }
        .course-name { font-style: italic; font-weight: bold; }
        .date, .certificate-id { font-size: 14px; color: #666; margin-top: 30px; }
        /* .logo { position: absolute; top: 30px; left: 30px; width: 80px; } */
        .signature-area { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; width: 200px; margin-left: auto; margin-right: auto; font-size: 14px; color: #555;}
    </style>
</head>
<body>
    <div class="certificate-container">
        <!-- <img src="/logo.png" alt="Logo" class="logo"> -->
        <div class="header">Certificado de Finalización</div>
        <div class="presented-to">Otorgado a:</div>
        <div class="student-name">{{NAME}}</div>
        <div class="description">
            Por haber completado satisfactoriamente el curso
            <span class="course-name">{{COURSE_NAME}}</span>.
        </div>
        <div class="date">Fecha de emisión: {{DATE}}</div>
        <div class="certificate-id">ID del Certificado: {{CERTIFICATE_ID}}</div>
        <div class="signature-area">Firma Autorizada</div>
    </div>
</body>
</html>
  `;
  return htmlTemplate;
}

// Renderiza el HTML del certificado reemplazando los placeholders por los datos reales
export function renderCertificateHtml(
  data: {
    fullName?: string | null;
    courseTitle?: string | null;
    issuedAtFormatted?: string | null;
    certificateCode?: string | null;
    institutionName?: string | null;
    username?: string | null;
    email?: string | null;
  },
  templateHtml: string
): string {
  let renderedHtml = templateHtml;
  if (data.fullName) {
    renderedHtml = renderedHtml.replace(/{{NAME}}/g, data.fullName || "");
  }
  if (data.courseTitle) {
    renderedHtml = renderedHtml.replace(
      /{{COURSE_NAME}}/g,
      data.courseTitle || ""
    );
  }
  if (data.issuedAtFormatted) {
    renderedHtml = renderedHtml.replace(
      /{{DATE}}/g,
      data.issuedAtFormatted || ""
    );
  }
  if (data.certificateCode) {
    renderedHtml = renderedHtml.replace(
      /{{CERTIFICATE_ID}}/g,
      data.certificateCode || ""
    );
  }
  // Puedes agregar más reemplazos si añades más placeholders en la plantilla
  return renderedHtml;
}

/**
 * Obtiene un certificado por su código (certificateId/code).
 * Incluye información del usuario y del curso.
 */
export async function getCertificateById(certificateId: string) {
  if (!certificateId) return null;
  const cert = await db.certificate.findUnique({
    where: { code: certificateId },
    include: {
      user: { select: { fullName: true } },
      course: { select: { title: true } },
    },
  });
  if (!cert) return null;
  return {
    certificateId: cert.code,
    studentName: cert.user?.fullName || "Estudiante",
    courseName: cert.course?.title || cert.title || "Curso",
    issuedAt: cert.issuedAt,
    // Puedes agregar más campos si lo necesitas
  };
}
