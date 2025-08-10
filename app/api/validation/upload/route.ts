import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { db } from "@/lib/db";
import { sendDocumentUploadEmails } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileUrl, fileSize } = body;

    if (!fileName || !fileUrl || !fileSize) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verificar que el archivo sea PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return new NextResponse("Only PDF files are allowed", { status: 400 });
    }

    // Verificar tamaño máximo (8MB en bytes)
    const maxSize = 8 * 1024 * 1024;
    if (fileSize > maxSize) {
      return new NextResponse("File size exceeds 8MB limit", { status: 400 });
    }

    const now = new Date();
    
    // Buscar validación existente del usuario
    const existingValidation = await db.documentValidation.findUnique({
      where: {
        userId: user.id,
      },
    });

    let documentValidation;

    if (existingValidation) {
      // Crear entrada de historial para el cambio de estado
      const historyEntry = {
        status: "PENDING",
        timestamp: now.toISOString(),
        previousStatus: existingValidation.status,
        fileName: fileName,
        fileSize: fileSize,
        action: "document_uploaded",
        note: "Document uploaded by user"
      };

      // Actualizar validación existente
      documentValidation = await db.documentValidation.update({
        where: {
          userId: user.id,
        },
        data: {
          status: "PENDING",
          fileName,
          fileUrl,
          fileSize,
          uploadedAt: now,
          reviewedBy: null,
          reviewedAt: null,
          rejectionReason: null,
          history: {
            push: historyEntry
          },
          updatedAt: now,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            }
          }
        }
      });
    } else {
      // Crear nueva validación
      const historyEntry = {
        status: "PENDING",
        timestamp: now.toISOString(),
        previousStatus: "NO_SUBMITTED",
        fileName: fileName,
        fileSize: fileSize,
        action: "document_uploaded",
        note: "Initial document upload"
      };

      documentValidation = await db.documentValidation.create({
        data: {
          userId: user.id,
          status: "PENDING",
          fileName,
          fileUrl,
          fileSize,
          uploadedAt: now,
          history: [historyEntry],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            }
          }
        }
      });
    }

    // Enviar notificaciones por email
    try {
      await sendDocumentUploadEmails({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
        },
        fileName,
        fileSize,
        validationId: documentValidation.id,
      });
    } catch (emailError) {
      console.error("Error sending upload notification emails:", emailError);
      // No fallar la subida por problemas de email
    }

    return NextResponse.json({
      message: "Document uploaded successfully",
      validation: documentValidation,
    });

  } catch (error) {
    console.error("[VALIDATION_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}