import puppeteer from "puppeteer";
import DefaultCertificateTemplate from "../templates/certificates/DefaultCertificateTemplate";
import cloudinary from "../lib/cloudinary";
import QRCode from "qrcode";

type CertificateData = {
  studentName: string;
  courseName: string;
  issueDate: string;
  certificateCode: string;
  backgroundImageUrl: string;
  qrCodeDataUrl?: string;
};

export async function generateCertificatePdf(
  data: CertificateData
): Promise<string> {
  // Generate QR code data URL
  const qrUrl = `https://tuapp.com/certificates/view/${data.certificateCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);

  // Add qrCodeDataUrl to data
  const dataWithQr = { ...data, qrCodeDataUrl };

  // Importar React y ReactDOMServer dinámicamente solo en el servidor
  const React = (await import("react")).default;
  const ReactDOMServer = (await import("react-dom/server")).default;

  // Render React component to static HTML
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(DefaultCertificateTemplate, dataWithQr)
  );

  // Wrap in a full HTML document
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Certificado</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f5f5f5;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // Set PDF options: A4 landscape, print background
    const pdfUint8Array = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      width: "1123px",
      height: "794px",
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    await page.close();
    // Convert Uint8Array to Buffer for Node.js compatibility
    const pdfBuffer = Buffer.from(pdfUint8Array);

    // Upload PDF to Cloudinary and return the URL
    const url = await uploadPdfToCloud(pdfBuffer, data.certificateCode);
    return url;
  } finally {
    await browser.close();
  }
}

/**
 * Uploads a PDF buffer to Cloudinary and returns the URL.
 * @param pdfBuffer Buffer containing the PDF data.
 * @param certificateCode Unique code to use as the public_id in Cloudinary.
 * @returns The URL of the uploaded PDF.
 */
async function uploadPdfToCloud(
  pdfBuffer: Buffer,
  certificateCode: string
): Promise<string> {
  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          public_id: `certificates/${certificateCode}`,
          format: "pdf",
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(pdfBuffer);
  });

  return uploadResult.secure_url;
}
