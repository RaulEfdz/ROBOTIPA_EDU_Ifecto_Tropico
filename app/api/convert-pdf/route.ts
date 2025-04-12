import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

// Deshabilitar el body parser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configuración del directorio de carga
const uploadDir = path.join(process.cwd(), "uploads");
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
}

async function readFile(req: NextRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ uploadDir, keepExtensions: true });
    const fields: any = {};
    const files: any = {};

    form.on("field", (name, value) => {
      fields[name] = value;
    });
    form.on("file", (name, file) => {
      files[name] = file;
    });
    form.on("end", () => {
      resolve({ fields, files });
    });
    form.on("error", (err) => {
      reject(err);
    });
    form.parse(req as any);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { files } = await readFile(req);
    const pdfFile = files.pdf_file as any;

    if (!pdfFile) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo PDF." },
        { status: 400 }
      );
    }

    // Convertir la ruta a absoluta y registrar para debug
    const absoluteFilePath = path.resolve(pdfFile.filepath);
    console.log("Ruta absoluta del archivo:", absoluteFilePath);

    // Verificar si el archivo existe antes de leerlo
    if (!fsSync.existsSync(absoluteFilePath)) {
      console.error("El archivo no existe:", absoluteFilePath);
      return NextResponse.json(
        { error: "El archivo PDF no se encontró en el servidor." },
        { status: 404 }
      );
    }

    // Procesar el archivo PDF
    const fileData = await fs.readFile(absoluteFilePath);
    const data = await pdf(fileData);
    const htmlContent = `<pre>${data.text}</pre>`;

    // Eliminar el archivo temporal
    await fs.unlink(absoluteFilePath);

    return NextResponse.json({ html: htmlContent }, { status: 200 });
  } catch (error: any) {
    console.error("Error al procesar el PDF:", error);
    return NextResponse.json(
      { error: "Error al procesar el archivo PDF." },
      { status: 500 }
    );
  }
}
