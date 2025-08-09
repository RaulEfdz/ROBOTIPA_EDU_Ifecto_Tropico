import { NextResponse } from "next/server";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUserFromDBServer();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Buscar la validación del usuario actual
    const documentValidation = await db.documentValidation.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    // Si no existe, crear una entrada con estado NO_SUBMITTED
    if (!documentValidation) {
      const newValidation = await db.documentValidation.create({
        data: {
          userId: user.id,
          status: "NO_SUBMITTED",
          history: [],
        },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      });

      return NextResponse.json(newValidation);
    }

    return NextResponse.json(documentValidation);
  } catch (error) {
    console.error("[VALIDATION_STATUS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}