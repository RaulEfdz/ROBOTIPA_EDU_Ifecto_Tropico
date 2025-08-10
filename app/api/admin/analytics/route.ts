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

    console.log(`📊 [ANALYTICS] Request by ${authResult.user?.email} (${authResult.role})`)

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
      case "all":
        startDate = new Date(2020, 0, 1) // Fecha muy antigua
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    // Obtener todos los profesores activos con sus datos
    const teachers = await db.user.findMany({
      where: {
        customRole: {
          // Buscar profesores
          in: await db.role.findMany({ where: { name: "teacher" } }).then(roles => roles.map(r => r.id))
        },
        isActive: true
      },
      include: {
        teachingSessions: {
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
        }
      }
    })

    const teacherPercentage = 0.8 // 80% para el profesor
    const baseRatePerCredit = 10 // $10 base por crédito

    // Calcular métricas por profesor
    const teacherPerformances = teachers.map(teacher => {
      const allSessions = teacher.teachingSessions
      const periodSessions = allSessions.filter(session => 
        session.scheduledAt >= startDate && session.scheduledAt <= now
      )

      const completedSessions = periodSessions.filter(s => s.status === "completed")
      const cancelledSessions = periodSessions.filter(s => s.status === "cancelled")
      
      // Calcular rating promedio
      const ratedSessions = completedSessions.filter(s => s.rating !== null)
      const averageRating = ratedSessions.length > 0
        ? ratedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSessions.length
        : 0

      // Calcular ganancias
      const totalCreditsEarned = completedSessions.reduce((sum, s) => sum + s.creditsRequired, 0)
      const totalEarnings = completedSessions.reduce((sum, s) => {
        return sum + (s.creditsRequired * teacherPercentage * baseRatePerCredit)
      }, 0)

      // Calcular satisfacción de estudiantes (% de ratings >= 4)
      const satisfiedStudents = ratedSessions.filter(s => (s.rating || 0) >= 4).length
      const studentsSatisfaction = ratedSessions.length > 0
        ? (satisfiedStudents / ratedSessions.length) * 100
        : 0

      // Calcular crecimiento mensual (comparar con mes anterior)
      const previousMonthStart = new Date(startDate)
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)
      
      const previousPeriodSessions = allSessions.filter(session => 
        session.scheduledAt >= previousMonthStart && 
        session.scheduledAt < startDate &&
        session.status === "completed"
      )
      
      const currentPeriodCount = completedSessions.length
      const previousPeriodCount = previousPeriodSessions.length
      
      const monthlyGrowth = previousPeriodCount > 0 
        ? ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100
        : currentPeriodCount > 0 ? 100 : 0

      return {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        teacherEmail: teacher.email,
        totalSessions: periodSessions.length,
        completedSessions: completedSessions.length,
        cancelledSessions: cancelledSessions.length,
        averageRating,
        totalEarnings,
        totalCreditsEarned,
        studentsSatisfaction,
        monthlyGrowth,
        joinDate: teacher.createdAt.toISOString(),
        lastActiveDate: teacher.updatedAt.toISOString(),
        topSubjects: [] // TODO: Implementar cuando tengas categorías de materias
      }
    }).filter(teacher => teacher.totalSessions > 0)

    // Ordenar por rendimiento general (combinando rating, sesiones y satisfacción)
    const topPerformers = [...teacherPerformances]
      .sort((a, b) => {
        // Criterio de ordenamiento: rating * sesiones * satisfacción
        const scoreA = a.averageRating * a.completedSessions * (a.studentsSatisfaction / 100)
        const scoreB = b.averageRating * b.completedSessions * (b.studentsSatisfaction / 100)
        return scoreB - scoreA
      })
      .slice(0, 10) // Top 10

    // Calcular métricas promedio
    const totalSessions = teacherPerformances.reduce((sum, t) => sum + t.totalSessions, 0)
    const totalCompletedSessions = teacherPerformances.reduce((sum, t) => sum + t.completedSessions, 0)
    const sessionCompletionRate = totalSessions > 0 ? (totalCompletedSessions / totalSessions) * 100 : 0

    const allRatings = teacherPerformances.filter(t => t.averageRating > 0)
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, t) => sum + t.averageRating, 0) / allRatings.length 
      : 0

    const monthlySessionsPerTeacher = teacherPerformances.length > 0
      ? totalCompletedSessions / teacherPerformances.length
      : 0

    const totalEarnings = teacherPerformances.reduce((sum, t) => sum + t.totalEarnings, 0)
    const averageEarningsPerTeacher = teacherPerformances.length > 0
      ? totalEarnings / teacherPerformances.length
      : 0

    // Estadísticas del período
    const totalRevenue = totalEarnings / teacherPercentage // Revenue total del sistema
    const activeTeachers = teacherPerformances.length

    // Contar nuevos profesores en el período
    const newTeachers = await db.user.count({
      where: {
        customRole: {
          in: await db.role.findMany({ where: { name: "teacher" } }).then(roles => roles.map(r => r.id))
        },
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    })

    const response = {
      topPerformers,
      averageMetrics: {
        sessionCompletionRate,
        averageRating,
        monthlySessionsPerTeacher,
        averageEarningsPerTeacher
      },
      periodStats: {
        totalSessions: totalCompletedSessions,
        totalRevenue,
        activeTeachers,
        newTeachers
      }
    }

    console.log(`✅ [ANALYTICS] Returned analytics for ${teacherPerformances.length} teachers`)

    return Response.json(response)

  } catch (error) {
    console.error("❌ [ANALYTICS] Error:", error)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}