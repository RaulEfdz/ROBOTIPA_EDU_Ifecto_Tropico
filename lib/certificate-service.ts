import { format } from "date-fns";
import { db } from "./db";
import type {
  Certificate as CertificateModel,
  User,
  Course,
} from "@prisma/client";

// Almacén temporal de plantillas de certificado (puedes expandirlo en el futuro)
const TEMPLATES_STORAGE: Record<string, string> = {
  "v1.0": `
    <html>
      <head><title>Certificado</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1>Certificado de Finalización</h1>
        <p>Otorgado a</p>
        <h2>{{fullName}}</h2>
        <p>por completar el curso</p>
        <h3>{{courseTitle}}</h3>
        <p>Emitido por: <b>{{institutionName}}</b></p>
        <p>Fecha de emisión: {{issuedAtFormatted}}</p>
        <p>Código de certificado: <b>{{certificateCode}}</b></p>
      </body>
    </html>
  `,
};

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
 * Reemplaza los placeholders en la plantilla HTML con los datos reales del certificado.
 */
export function renderCertificateHtml(
  certificateData: Record<string, any>,
  templateHtml: string
): string {
  let renderedHtml = templateHtml;
  for (const key in certificateData) {
    const placeholder = `{{${key}}}`;
    renderedHtml = renderedHtml.replace(
      new RegExp(placeholder, "g"),
      certificateData[key]?.toString() || ""
    );
  }
  return renderedHtml;
}

/**
 * Obtiene el HTML de la plantilla según la versión especificada.
 */
export async function getCertificateTemplateHtml(
  templateVersion?: string
): Promise<string | null> {
  const version =
    templateVersion ||
    process.env.DEFAULT_CERTIFICATE_TEMPLATE_VERSION ||
    "v1.0";
  return TEMPLATES_STORAGE[version] || null;
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
