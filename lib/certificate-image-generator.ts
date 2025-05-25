import path from "path";

export function getCertificateTemplateHtml(
  fullName: string,
  courseTitle: string
): string {
  const imagePath = path.resolve(
    process.cwd(),
    "public",
    "Certificado-de-Participación-Animales.png"
  );

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Certificado</title>
    <style>
      @font-face {
        font-family: 'Arial';
        src: local('Arial'), local('Arial');
      }
      body, html {
        margin: 0;
        padding: 0;
        width: 800px;
        height: 560px;
        position: relative;
        font-family: Arial, sans-serif;
      }
      .certificate-container {
        width: 800px;
        height: 560px;
        background-image: url("file://${imagePath.replace(/\\\\/g, "/")}");
        background-size: cover;
        background-position: center;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: #2a7a64;
      }
      .fullName {
        font-weight: bold;
        font-size: 48px;
        margin-bottom: 20px;
      }
      .courseTitle {
        font-size: 28px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="certificate-container">
      <div class="fullName">${fullName}</div>
      <div class="courseTitle">${courseTitle}</div>
    </div>
  </body>
  </html>
  `;
}
