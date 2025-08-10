import { NextRequest } from "next/server"
import { validateAccess, createAccessDeniedResponse, createUnauthorizedResponse } from "@/middleware/security"
import { type RoleName } from "@/utils/roles/hierarchy"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requiredRole, adminOnly } = body

    // Validar acceso usando el middleware de seguridad
    const authResult = await validateAccess(req, {
      requiredRole: requiredRole as RoleName,
      adminOnly: adminOnly || false,
      logAccess: true
    })

    if (!authResult.authorized) {
      // Si no está autenticado
      if (!authResult.user) {
        return createUnauthorizedResponse(authResult.reason)
      }
      
      // Si está autenticado pero no autorizado
      return Response.json({
        hasAccess: false,
        role: authResult.role || "unknown",
        reason: authResult.reason
      }, { status: 200 }) // 200 para que el cliente pueda mostrar el mensaje
    }

    // Acceso autorizado
    return Response.json({
      hasAccess: true,
      role: authResult.role,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        fullName: authResult.user.fullName
      }
    })

  } catch (error) {
    console.error("❌ [VALIDATE_ACCESS] Error:", error)
    return Response.json(
      { 
        hasAccess: false, 
        error: "Error interno del servidor",
        reason: "Error al validar permisos"
      },
      { status: 500 }
    )
  }
}