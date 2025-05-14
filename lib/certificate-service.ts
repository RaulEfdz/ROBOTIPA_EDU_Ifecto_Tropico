import { format } from "date-fns";

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
  // Puedes agregar más versiones aquí
};

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
  let code = `CERT${separator}${cIdPart}${separator}${uIdPart}${separator}${datePart}`;
  // Opcional: Verificar colisión en DB (no implementado por simplicidad)
  return code;
}

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

export async function getCertificateTemplateHtml(
  templateVersion: string
): Promise<string | null> {
  const version =
    templateVersion ||
    process.env.DEFAULT_CERTIFICATE_TEMPLATE_VERSION ||
    "v1.0";
  return TEMPLATES_STORAGE[version] || null;
}
