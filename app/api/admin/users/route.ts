import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin, createAccessDeniedResponse } from "@/middleware/security"
import { translateRole } from "@/utils/roles/translate"

export async function GET(req: NextRequest) {
  try {
    // Validar permisos administrativos
    const authResult = await requireAdmin(req)
    
    if (!authResult.authorized) {
      return createAccessDeniedResponse(authResult.reason)
    }

    console.log(`👥 [USER_MANAGEMENT] Request by ${authResult.user?.email} (${authResult.role})`)

    // Obtener todos los usuarios con información relacionada
    const users = await db.user.findMany({
      include: {
        teachingSessions: {
          where: { status: "completed" },
          select: { creditsRequired: true }
        },
        studentSessions: {
          where: { status: "completed" },
          select: { creditsRequired: true }
        }
      },
      orderBy: [
        { isActive: "desc" },
        { createdAt: "desc" }
      ]
    })

    const processedUsers = await Promise.all(users.map(async (user) => {
      // Traducir rol
      let roleName = "unknown"
      try {
        roleName = translateRole(user.customRole)
      } catch (error) {
        console.warn(`⚠️ [USER_MANAGEMENT] Invalid role for user ${user.email}:`, user.customRole)
      }

      // Calcular estadísticas
      const teachingSessions = user.teachingSessions.length
      const studentSessions = user.studentSessions.length
      const totalSessions = teachingSessions + studentSessions

      // Calcular ganancias para profesores
      let totalEarnings = undefined
      if (roleName === "teacher") {
        const teacherPercentage = 0.8 // 80% para profesores
        const baseRatePerCredit = 10 // $10 por crédito
        totalEarnings = user.teachingSessions.reduce((sum, session) => {
          return sum + (session.creditsRequired * teacherPercentage * baseRatePerCredit)
        }, 0)
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: roleName,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString(), // Usar updatedAt como aproximación de última actividad
        sessionsCount: totalSessions,
        totalEarnings
      }
    }))

    // Filtrar usuarios según jerarquía
    // Los admins no pueden ver super_admins (a menos que sean super_admin)
    const filteredUsers = processedUsers.filter(user => {
      if (authResult.role === "super_admin") {
        return true // Super admin ve todo
      }
      
      if (authResult.role === "admin") {
        return user.role !== "super_admin" // Admin no ve super_admin
      }
      
      return false // Otros roles no deberían llegar aquí
    })

    console.log(`✅ [USER_MANAGEMENT] Returned ${filteredUsers.length} users`)

    return Response.json({
      users: filteredUsers,
      currentUserRole: authResult.role
    })

  } catch (error) {
    console.error("❌ [USER_MANAGEMENT] Error:", error)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}