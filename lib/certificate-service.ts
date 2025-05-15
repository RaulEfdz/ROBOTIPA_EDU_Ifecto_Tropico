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
