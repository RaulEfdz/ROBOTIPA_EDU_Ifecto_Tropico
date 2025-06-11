import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      include: {
        // Cursos creados por el usuario (como instructor)
        courses: {
          include: {
            category: true,
            chapters: {
              include: {
                video: true,
                userProgress: true,
              },
            },
            attachments: true,
            purchases: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            Certificate: true,
            exams: true,
          },
        },
        // Cursos a los que está inscrito (comprados)
        purchases: {
          include: {
            course: {
              include: {
                category: true,
                chapters: true,
                attachments: true,
                Certificate: true,
              },
            },
          },
        },
        // Progreso en capítulos
        userProgress: {
          include: {
            chapter: {
              include: {
                course: true,
                video: true,
              },
            },
          },
        },
        // Certificados obtenidos
        Certificate: {
          include: {
            course: true,
          },
        },
        // Facturas
        invoices: true,
        // Intentos de exámenes
        examAttempts: {
          include: {
            exam: true,
            answers: true,
          },
        },
        // Suscripción
        Subscription: true,
        // Métodos de pago y pagos
        PaymentMethod: {
          include: {
            Payment: true,
          },
        },
        Payment: true,
        // Logs, notificaciones, accesos, documentos legales
        AuditLog: true,
        Notification: true,
        UserAccess: {
          include: {
            tool: true,
          },
        },
        LegalDocument: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
