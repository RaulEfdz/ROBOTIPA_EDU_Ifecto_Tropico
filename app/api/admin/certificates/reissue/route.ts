import { NextRequest, NextResponse } from "next/server";
import { generateCertificate } from "@/lib/certificate-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId } = await req.json();

    if (!userId || !courseId) {
      return new NextResponse("Missing userId or courseId", { status: 400 });
    }

    // Verificar si ya existe certificado para ese usuario y curso
    const existing = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existing) {
      return new NextResponse("Certificate already exists for this course", {
        status: 400,
      });
    }

    // Generar certificado
    const certificate = await generateCertificate(userId, courseId);

    if (!certificate) {
      return new NextResponse("Failed to generate certificate", {
        status: 500,
      });
    }

    return NextResponse.json({
      message: "Certificate created successfully",
      certificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
