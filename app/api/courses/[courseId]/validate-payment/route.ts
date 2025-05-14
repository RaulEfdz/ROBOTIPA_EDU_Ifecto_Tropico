import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Buscar un pago exitoso que contenga el courseId en el campo description
    const payment = await db.payment.findFirst({
      where: {
        userId: user.id,
        status: "APPROVED",
        description: {
          contains: courseId,
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ valid: false }, { status: 403 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error en validación de pago:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
