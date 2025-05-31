import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    // Extraer query params para validación sin autenticación
    const url = new URL(req.url);
    const query = url.searchParams;

    // Validar estado y curso
    const status = query.get("status")?.toLowerCase();
    const razonField = query.get("Razon") || query.get("razon") || "";
    const razonDecoded = decodeURIComponent(razonField.replace(/\+/g, " "));

    if (!status || !courseId) {
      return NextResponse.json(
        { valid: false, message: "Faltan parámetros status o courseId" },
        { status: 400 }
      );
    }

    // Validar status success
    if (status !== "success") {
      return NextResponse.json(
        { valid: false, message: `Estado del pago: ${status}. No exitoso.` },
        { status: 400 }
      );
    }

    // Validar razon aprobado
    const isRazonApproved =
      razonDecoded.includes("00 - Aprobado") ||
      razonDecoded.includes("Aprobado");
    if (!isRazonApproved && razonField) {
      return NextResponse.json(
        {
          valid: false,
          message: `Razón del pago: ${razonDecoded}. No aprobado.`,
        },
        { status: 400 }
      );
    }

    // Validar oper y estado
    const operCode = query.get("Oper");
    const estado = query.get("Estado");
    if (!operCode || estado?.toLowerCase() !== "aprobada") {
      return NextResponse.json(
        { valid: false, message: "Oper o Estado inválidos" },
        { status: 400 }
      );
    }

    // Buscar pago en DB que coincida con courseId
    const payment = await db.payment.findFirst({
      where: {
        status: "APPROVED",
        description: {
          contains: courseId,
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { valid: false, message: "Pago no encontrado en base de datos" },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error en validación de pago:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
