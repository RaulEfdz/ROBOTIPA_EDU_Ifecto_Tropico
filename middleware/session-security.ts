// Middleware de seguridad para sesiones
import { db } from "@/lib/db"
import { translateRole } from "@/utils/roles/translate"

export async function validateSessionAccess(
  user: { id: string; customRole: string; email: string },
  sessionId: string,
  operation: "view" | "edit" | "cancel" | "join"
): Promise<{ authorized: boolean; reason?: string; session?: any }> {
  try {
    // 1. Obtener la sesión
    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        teacher: { select: { id: true, email: true } },
        student: { select: { id: true, email: true } }
      }
    })

    if (!session) {
      return { authorized: false, reason: "Session not found" }
    }

    // 2. Determinar el rol del usuario
    let userRole = "unknown"
    try {
      userRole = translateRole(user.customRole)
    } catch (error) {
      return { authorized: false, reason: "Invalid user role" }
    }

    // 3. Validar acceso según el rol y operación
    switch (userRole) {
      case "student":
        // Estudiante solo puede acceder a sus propias sesiones
        if (session.studentId !== user.id) {
          return { 
            authorized: false, 
            reason: `Student ${user.email} cannot access session belonging to student ${session.student?.email}` 
          }
        }
        
        // Estudiantes pueden ver y cancelar, pero no editar
        if (operation === "edit") {
          return { authorized: false, reason: "Students cannot edit sessions" }
        }
        break

      case "teacher":
        // Profesor solo puede acceder a sesiones donde es el profesor
        if (session.teacherId !== user.id) {
          return { 
            authorized: false, 
            reason: `Teacher ${user.email} cannot access session belonging to teacher ${session.teacher?.email}` 
          }
        }
        // Profesores pueden hacer todas las operaciones en sus sesiones
        break

      case "admin":
        // Admin puede hacer todo
        break

      default:
        return { authorized: false, reason: `Role ${userRole} has no session access` }
    }

    return { authorized: true, session }

  } catch (error) {
    console.error("[SESSION_SECURITY] Error validating access:", error)
    return { authorized: false, reason: "Internal security error" }
  }
}

export async function logSessionAccess(
  user: { id: string; email: string },
  sessionId: string,
  operation: string,
  success: boolean,
  reason?: string
) {
  console.log(`🔒 [SESSION_ACCESS] ${user.email} ${operation} session ${sessionId}: ${success ? 'ALLOWED' : 'DENIED'}${reason ? ` - ${reason}` : ''}`)
}