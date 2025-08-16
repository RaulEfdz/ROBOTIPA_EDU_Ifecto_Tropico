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

    console.log(`📊 [ADMIN_STATS] Request by ${authResult.user?.email} (${authResult.role})`)

    // Calcular estadísticas del sistema
    const now = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(now.getMonth() - 1)

    // Estadísticas de usuarios
    const [totalTeachers, activeTeachers] = await Promise.all([
      db.user.count({
        where: {
          customRole: "teacher"
        }
      }),
      db.user.count({
        where: {
          customRole: "teacher",
          isActive: true,
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Activo en últimos 30 días
          }
        }
      })
    ])

    const [totalStudents, activeStudents] = await Promise.all([
      db.user.count({
        where: {
          customRole: "student"
        }
      }),
      db.user.count({
        where: {
          customRole: "student",
          isActive: true,
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Estadísticas de sesiones
    const totalSessions = await db.liveSession.count({
      where: {
        status: "completed",
        scheduledAt: {
          gte: lastMonth,
          lte: now
        }
      }
    })

    // Calcular pagos pendientes
    const completedSessions = await db.liveSession.findMany({
      where: {
        status: "completed"
      },
      select: {
        creditsRequired: true
      }
    })

    const teacherPercentage = 0.8 // 80% para profesores
    const baseRatePerCredit = 10 // $10 por crédito
    
    const pendingPayments = completedSessions.reduce((total, session) => {
      return total + (session.creditsRequired * teacherPercentage * baseRatePerCredit)
    }, 0)

    // Calcular ingresos totales (comisión de la plataforma)
    const platformPercentage = 0.2 // 20% para la plataforma
    const totalRevenue = completedSessions.reduce((total, session) => {
      return total + (session.creditsRequired * platformPercentage * baseRatePerCredit)
    }, 0)

    // Calcular crecimiento mensual
    const lastMonthSessions = await db.liveSession.count({
      where: {
        status: "completed",
        scheduledAt: {
          gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: lastMonth
        }
      }
    })

    const monthlyGrowth = lastMonthSessions > 0 
      ? ((totalSessions - lastMonthSessions) / lastMonthSessions) * 100 
      : 100

    const stats = {
      totalTeachers,
      activeTeachers,
      totalStudents,
      activeStudents,
      totalSessions,
      pendingPayments,
      totalRevenue,
      monthlyGrowth
    }

    console.log(`✅ [ADMIN_STATS] Stats calculated:`, {
      teachers: `${activeTeachers}/${totalTeachers}`,
      students: `${activeStudents}/${totalStudents}`,
      sessions: totalSessions,
      pending: `$${pendingPayments.toFixed(2)}`
    })

    return Response.json(stats)

  } catch (error) {
    console.error("❌ [ADMIN_STATS] Error:", error)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}