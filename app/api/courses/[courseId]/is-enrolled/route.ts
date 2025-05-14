// app/api/courses/[courseId]/is-enrolled/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth"; // Asegúrate que la ruta a esta función sea correcta

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function GET(
  req: Request, // El primer parámetro suele ser Request
  { params }: { params: Promise<{ courseId: string }> } // El segundo parámetro es un objeto con `params`
) {
  try {
    const { courseId } = await params; // Acceso directo al courseId con await

    // VALIDACIÓN EXPLÍCITA DE courseId
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      console.warn(
        "[IS_ENROLLED_GET] Bad Request: courseId is missing or invalid. Received:",
        courseId
      );
      return new NextResponse(
        "Bad Request: courseId is required and must be a non-empty string",
        {
          status: 400,
        }
      );
    }

    const user = (await getUserDataServerAuth())?.user; // Tu función de autenticación

    if (!user?.id) {
      console.warn("[IS_ENROLLED_GET] Unauthorized: No user session found.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId, // Usar el courseId validado
        },
      },
    });

    // En lugar de !purchase, verifica directamente el valor de purchase
    if (purchase) {
      return NextResponse.json({
        isEnrolled: true, // Cambiado de 'enrolled' a 'isEnrolled' para consistencia con el frontend
        purchaseId: purchase.id,
        enrolledAt: purchase.createdAt,
      });
    } else {
      return NextResponse.json({ isEnrolled: false }); // Cambiado de 'enrolled' a 'isEnrolled'
    }
  } catch (error) {
    console.error("[IS_ENROLLED_GET] Internal Server Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
