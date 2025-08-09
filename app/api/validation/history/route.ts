import { NextResponse } from "next/server";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUserFromDBServer();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Buscar la validación del usuario actual con historial
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

    if (!documentValidation) {
      return NextResponse.json({
        history: [],
        current: null
      });
    }

    // Formatear el historial para el frontend
    const formattedHistory = (documentValidation.history as any[]).map((entry: any) => ({
      id: `${documentValidation.id}-${entry.timestamp}`,
      status: entry.status,
      timestamp: entry.timestamp,
      previousStatus: entry.previousStatus,
      action: entry.action,
      note: entry.note,
      fileName: entry.fileName,
      fileSize: entry.fileSize,
      rejectionReason: entry.rejectionReason,
      reviewerName: entry.reviewerName,
    }));

    return NextResponse.json({
      history: formattedHistory,
      current: {
        id: documentValidation.id,
        status: documentValidation.status,
        fileName: documentValidation.fileName,
        fileUrl: documentValidation.fileUrl,
        fileSize: documentValidation.fileSize,
        uploadedAt: documentValidation.uploadedAt,
        reviewedAt: documentValidation.reviewedAt,
        rejectionReason: documentValidation.rejectionReason,
        reviewer: documentValidation.reviewer,
        createdAt: documentValidation.createdAt,
        updatedAt: documentValidation.updatedAt,
      }
    });
  } catch (error) {
    console.error("[VALIDATION_HISTORY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}