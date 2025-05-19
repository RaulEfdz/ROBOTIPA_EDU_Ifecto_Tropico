// app/api/certificates/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "ID de certificado requerido" },
      { status: 400 }
    );
  }

  const certificate = await db.certificate.findUnique({
    where: { code: id },
    include: {
      user: { select: { fullName: true } },
      course: { select: { title: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificado no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    studentName: certificate.user.fullName,
    certificateId: certificate.code,
    courseName: certificate.course.title,
    pdfUrl: certificate.pdfUrl,
  });
}
