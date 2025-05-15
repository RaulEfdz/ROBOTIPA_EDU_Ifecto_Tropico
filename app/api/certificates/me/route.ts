import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET() {
  try {
    const authUser = (await getUserDataServerAuth())?.user;
    if (!authUser?.id) {
      return new NextResponse(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
      });
    }
    const certificatesFromDB = await db.certificate.findMany({
      where: { userId: authUser.id },
      include: {
        course: {
          select: {
            title: true,
            // imageUrl: true, // Si quieres mostrar la imagen del curso
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
    if (!certificatesFromDB) {
      return NextResponse.json([]);
    }
    const formattedCertificates = certificatesFromDB.map((cert) => {
      const studentName =
        cert.user?.fullName ||
        authUser.user_metadata?.full_name ||
        "Nombre del Estudiante";
      return {
        id: cert.id,
        studentName,
        certificateId: cert.code,
        courseName: cert.course?.title || "Nombre del Curso Desconocido",
        // Puedes agregar más campos si lo necesitas
      };
    });
    return NextResponse.json(formattedCertificates);
  } catch (error) {
    console.error("[API_CERTIFICATES_ME_GET]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
