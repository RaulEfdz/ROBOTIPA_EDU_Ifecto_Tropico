import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireRole, createAccessDeniedResponse } from "@/middleware/security"

export async function GET(req: NextRequest) {
  try {
    // Validar que sea profesor
    const authResult = await requireRole(req, "teacher")
    
    if (!authResult.authorized) {
      return createAccessDeniedResponse(authResult.reason)
    }

    console.log(`📊 [TEACHER_EARNINGS] Request by ${authResult.user?.email} (${authResult.role})`)

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "month"

    // Primero verificar si el profesor tiene sesiones en absoluto
    const allTeacherSessions = await db.liveSession.findMany({
      where: {
        teacherId: authResult.user.id
      },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        creditsRequired: true
      }
    })

    console.log(`📊 [TEACHER_EARNINGS] Teacher ${authResult.user?.email} has ${allTeacherSessions.length} total sessions`)
    console.log(`📊 [TEACHER_EARNINGS] Session statuses:`, allTeacherSessions.reduce((acc: any, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1
      return acc
    }, {}))

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

    // Obtener sesiones completadas del profesor en el período
    const completedSessions = await db.liveSession.findMany({
      where: {
        teacherId: authResult.user.id,
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
    })

    console.log(`📊 [TEACHER_EARNINGS] Found ${completedSessions.length} completed sessions in period`)

    // También obtener sesiones programadas/confirmadas para mostrar información adicional
    const upcomingSessions = await db.liveSession.findMany({
      where: {
        teacherId: authResult.user.id,
        status: {
          in: ["scheduled", "confirmed"]
        },
        scheduledAt: {
          gte: now
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
        scheduledAt: "asc"
      },
      take: 5
    })

    console.log(`📊 [TEACHER_EARNINGS] Found ${upcomingSessions.length} upcoming sessions`)

    // Calcular métricas
    const totalCredits = completedSessions.reduce((sum, session) => sum + session.creditsRequired, 0)
    
    // Calcular ganancias (necesitarás ajustar esto según tu modelo de negocio)
    // Por ejemplo, si el profesor recibe 80% de los créditos
    const teacherPercentage = 0.8 // 80% para el profesor
    const totalEarnings = completedSessions.reduce((sum, session) => {
      // Buscar el precio por crédito en la disponibilidad del profesor para esa fecha
      return sum + (session.creditsRequired * teacherPercentage * 10) // Asumiendo $10 por crédito, ajusta según tu lógica
    }, 0)

    const sessionsWithRating = completedSessions.filter(s => s.rating !== null)
    const averageRating = sessionsWithRating.length > 0 
      ? sessionsWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsWithRating.length 
      : 0

    // Sesiones recientes (últimas 10)
    const recentSessions = completedSessions.slice(0, 10).map(session => ({
      id: session.id,
      title: session.title,
      scheduledAt: session.scheduledAt.toISOString(),
      creditsEarned: session.creditsRequired,
      rating: session.rating,
      feedback: session.feedback,
      student: {
        fullName: session.student.fullName
      }
    }))

    // Estadísticas mensuales (últimos 6 meses)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(now.getMonth() - i)
      monthDate.setDate(1)
      
      const nextMonth = new Date(monthDate)
      nextMonth.setMonth(monthDate.getMonth() + 1)

      const monthSessions = completedSessions.filter(session => 
        session.scheduledAt >= monthDate && session.scheduledAt < nextMonth
      )

      const monthCredits = monthSessions.reduce((sum, s) => sum + s.creditsRequired, 0)
      const monthEarnings = monthCredits * teacherPercentage * 10

      monthlyStats.push({
        month: monthDate.toLocaleDateString('es', { month: 'long', year: 'numeric' }),
        credits: monthCredits,
        earnings: monthEarnings,
        sessions: monthSessions.length
      })
    }

    const response = {
      totalCredits,
      totalEarnings,
      completedSessions: completedSessions.length,
      averageRating,
      recentSessions,
      monthlyStats: monthlyStats.filter(stat => stat.sessions > 0),
      // Información adicional para debugging y contexto
      debugInfo: {
        totalSessionsAllTime: allTeacherSessions.length,
        upcomingSessionsCount: upcomingSessions.length,
        searchPeriod: {
          from: startDate.toISOString(),
          to: now.toISOString(),
          period
        }
      },
      upcomingSessions: upcomingSessions.map(session => ({
        id: session.id,
        title: session.title,
        scheduledAt: session.scheduledAt.toISOString(),
        status: session.status,
        creditsRequired: session.creditsRequired,
        student: {
          fullName: session.student.fullName
        }
      }))
    }

    return Response.json(response)

  } catch (error) {
    console.error("❌ [TEACHER_EARNINGS] Error:", error)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}