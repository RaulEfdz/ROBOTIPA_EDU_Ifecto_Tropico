import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin, createAccessDeniedResponse } from "@/middleware/security"

export async function GET(req: NextRequest) {
  try {
    // Validar permisos administrativos
    const authResult = await requireAdmin(req)
    
    if (!authResult.authorized) {
      return createAccessDeniedResponse(authResult.reason)
    }

    console.log(`💰 [TEACHER_PAYMENTS] Request by ${authResult.user?.email} (${authResult.role})`)

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "month"

    // Calcular fechas según el período
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    // Obtener todos los profesores con sesiones completadas
    const teachersWithSessions = await db.user.findMany({
      where: {
        customRole: {
          // Buscar el ID del rol de profesor
          in: await db.role.findMany({ where: { name: "teacher" } }).then(roles => roles.map(r => r.id))
        },
        isActive: true
      },
      include: {
        teachingSessions: {
          where: {
            status: "completed",
            scheduledAt: {
              gte: startDate,
              lte: now
            }
          },
          include: {
            student: {
              select: {
                fullName: true
              }
            }
          },
          orderBy: {
            scheduledAt: "desc"
          }
        },
        // Incluir pagos previos (cuando implementes el modelo de pagos)
        // payments: {
        //   where: {
        //     createdAt: {
        //       gte: startDate,
        //       lte: now
        //     }
        //   }
        // }
      }
    })

    const teacherPercentage = 0.8 // 80% para el profesor
    const baseRatePerCredit = 10 // $10 base por crédito

    const paymentsData = teachersWithSessions
      .filter(teacher => teacher.teachingSessions.length > 0)
      .map(teacher => {
        const sessions = teacher.teachingSessions
        const totalCredits = sessions.reduce((sum, session) => sum + session.creditsRequired, 0)
        const totalEarnings = sessions.reduce((sum, session) => {
          return sum + (session.creditsRequired * teacherPercentage * baseRatePerCredit)
        }, 0)

        // TODO: Calcular el monto ya pagado cuando implementes el modelo de pagos
        const paidAmount = 0 // sessions.reduce((sum, session) => sum + session.paidAmount || 0, 0)
        const pendingAmount = totalEarnings - paidAmount

        return {
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          teacherEmail: teacher.email,
          totalCredits,
          totalEarnings,
          completedSessions: sessions.length,
          lastPaymentDate: null, // TODO: Implementar cuando tengas modelo de pagos
          pendingAmount,
          sessions: sessions.map(session => ({
            id: session.id,
            title: session.title,
            scheduledAt: session.scheduledAt.toISOString(),
            creditsRequired: session.creditsRequired,
            earnings: session.creditsRequired * teacherPercentage * baseRatePerCredit,
            student: {
              fullName: session.student.fullName
            }
          }))
        }
      })
      .sort((a, b) => b.pendingAmount - a.pendingAmount) // Ordenar por monto pendiente descendente

    return Response.json(paymentsData)

  } catch (error) {
    console.error("❌ [TEACHER_PAYMENTS] Error:", error)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}