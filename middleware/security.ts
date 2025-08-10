import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { translateRole } from "@/utils/roles/translate"
import { hasMinimumRoleLevel, canAccessAdminModule, type RoleName } from "@/utils/roles/hierarchy"

interface SecurityOptions {
  requiredRole?: RoleName
  adminOnly?: boolean
  allowSelf?: boolean // Permite acceso si es el propio usuario
  logAccess?: boolean
}

/**
 * Middleware principal de seguridad
 */
export async function validateAccess(
  req: NextRequest,
  options: SecurityOptions = {}
): Promise<{ authorized: boolean; user?: any; role?: RoleName; reason?: string }> {
  try {
    // 1. Obtener usuario autenticado
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return { 
        authorized: false, 
        reason: "Usuario no autenticado" 
      }
    }

    // 2. Traducir y validar rol
    let userRole: RoleName = "unknown"
    try {
      const translatedRole = translateRole(user.customRole)
      userRole = translatedRole as RoleName
    } catch (error) {
      console.error(`🔒 [SECURITY] Invalid role for user ${user.email}:`, user.customRole)
      return { 
        authorized: false, 
        reason: "Rol de usuario inválido" 
      }
    }

    // 3. Verificar si el usuario está activo
    if (!user.isActive) {
      return { 
        authorized: false, 
        reason: "Usuario desactivado" 
      }
    }

    // 4. Aplicar validaciones según opciones
    const { requiredRole, adminOnly, allowSelf = false, logAccess = true } = options

    // Verificar acceso administrativo
    if (adminOnly && !canAccessAdminModule(userRole)) {
      if (logAccess) {
        console.warn(`🚫 [SECURITY] Admin access denied for ${user.email} (${userRole})`)
      }
      return { 
        authorized: false, 
        reason: "Acceso administrativo denegado - permisos insuficientes" 
      }
    }

    // Verificar rol mínimo requerido
    if (requiredRole && !hasMinimumRoleLevel(userRole, requiredRole)) {
      if (logAccess) {
        console.warn(`🚫 [SECURITY] Role requirement not met: ${user.email} (${userRole}) needs ${requiredRole}`)
      }
      return { 
        authorized: false, 
        reason: `Se requiere rol ${requiredRole} o superior` 
      }
    }

    // 5. Log de acceso exitoso
    if (logAccess) {
      console.log(`✅ [SECURITY] Access granted for ${user.email} (${userRole})`)
    }

    return {
      authorized: true,
      user,
      role: userRole
    }

  } catch (error) {
    console.error("🔒 [SECURITY] Error in security validation:", error)
    return { 
      authorized: false, 
      reason: "Error interno de seguridad" 
    }
  }
}

/**
 * Middleware para APIs que requieren autenticación básica
 */
export async function requireAuth(req: NextRequest) {
  return await validateAccess(req, { logAccess: true })
}

/**
 * Middleware para APIs que requieren permisos administrativos
 */
export async function requireAdmin(req: NextRequest) {
  return await validateAccess(req, { 
    adminOnly: true, 
    logAccess: true 
  })
}

/**
 * Middleware para APIs que requieren un rol mínimo específico
 */
export async function requireRole(req: NextRequest, role: RoleName) {
  return await validateAccess(req, { 
    requiredRole: role, 
    logAccess: true 
  })
}

/**
 * Crear respuesta de acceso denegado
 */
export function createAccessDeniedResponse(reason?: string) {
  return NextResponse.json(
    { 
      error: "Acceso denegado", 
      reason: reason || "Permisos insuficientes",
      code: "ACCESS_DENIED"
    }, 
    { status: 403 }
  )
}

/**
 * Crear respuesta de no autorizado
 */
export function createUnauthorizedResponse(reason?: string) {
  return NextResponse.json(
    { 
      error: "No autorizado", 
      reason: reason || "Autenticación requerida",
      code: "UNAUTHORIZED"
    }, 
    { status: 401 }
  )
}

/**
 * Helper para validar si el usuario puede acceder a datos de otro usuario
 */
export function canAccessUserData(
  currentRole: RoleName, 
  currentUserId: string, 
  targetUserId: string,
  targetRole?: RoleName
): boolean {
  // Siempre puede acceder a sus propios datos
  if (currentUserId === targetUserId) {
    return true
  }

  // Los admins pueden acceder a datos de usuarios de menor jerarquía
  if (canAccessAdminModule(currentRole)) {
    if (targetRole) {
      return hasMinimumRoleLevel(currentRole, targetRole) && currentRole !== targetRole
    }
    return true
  }

  return false
}