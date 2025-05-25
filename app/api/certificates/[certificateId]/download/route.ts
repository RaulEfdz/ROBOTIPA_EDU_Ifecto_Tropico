import { PDFDocument } from "pdf-lib";
import { getCertificateById } from "@/lib/certificate-service";

export async function GET(request: Request, context: any) {
  const { certificateId } = context.params;

  // 1. Buscar certificado
  const certificate = await getCertificateById(certificateId);

  if (
    !certificate ||
    typeof certificate !== "object" ||
    !("fileUrl" in certificate) ||
    !certificate.fileUrl ||
    typeof certificate.fileUrl !== "string"
  ) {
    return new Response("Certificado no encontrado o URL inválida.", {
      status: 404,
    });
  }

  try {
    // 2. Descargar la imagen como arrayBuffer
    const imageResponse = await fetch(certificate.fileUrl);
    if (!imageResponse.ok) {
      return new Response("Error al descargar la imagen", { status: 500 });
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    // 3. Crear un nuevo PDF e insertar la imagen
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const contentType = imageResponse.headers.get("content-type") || "";
    let image;
    if (contentType.includes("png")) {
      image = await pdfDoc.embedPng(imageBuffer);
    } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      image = await pdfDoc.embedJpg(imageBuffer);
    } else {
      return new Response("Formato de imagen no soportado", { status: 415 });
    }

    const { width, height } = image.scale(1);

    // Ajustar tamaño del PDF a la imagen
    page.setSize(width, height);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });

    const pdfBytes = await pdfDoc.save();

    // 4. Responder el PDF generado
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado_${"code" in certificate ? certificate.code : certificateId}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error generando el PDF:", error);
    return new Response("Error generando el PDF del certificado.", {
      status: 500,
    });
  }
}
