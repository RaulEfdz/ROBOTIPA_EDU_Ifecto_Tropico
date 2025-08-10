import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin, createAccessDeniedResponse } from "@/middleware/security"
import { ROLE_HIERARCHY } from "@/utils/roles/hierarchy"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const authResult = await requireAdmin(req)
    
    if (!authResult.authorized) {
      return createAccessDeniedResponse(authResult.reason)
    }

    const body = await req.json()

    console.log(`👤 [USER_UPDATE] Request by ${authResult.user?.email} (${authResult.role}) for user ${userId}`)

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: true
      }
    })

    if (!targetUser) {
      return Response.json(
        { error: "Usuario no encontrado", reason: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }

    const currentUserLevel = ROLE_HIERARCHY[authResult.role as keyof typeof ROLE_HIERARCHY] || 0
    
    let targetUserRole = "unknown"
    if (targetUser.role) {
      targetUserRole = targetUser.role.name
    }
    
    const targetUserLevel = ROLE_HIERARCHY[targetUserRole as keyof typeof ROLE_HIERARCHY] || 0

    if (targetUserRole === "admin" && authResult.role !== "super_admin") {
      return Response.json(
        { 
          error: "Sin permisos suficientes", 
          reason: "INSUFFICIENT_PERMISSIONS",
          details: "Solo super administradores pueden modificar administradores"
        },
        { status: 403 }
      )
    }

    if (targetUserRole === "super_admin" && authResult.role !== "super_admin") {
      return Response.json(
        { 
          error: "Sin permisos suficientes", 
          reason: "INSUFFICIENT_PERMISSIONS",
          details: "Solo super administradores pueden modificar otros super administradores"
        },
        { status: 403 }
      )
    }

    if (currentUserLevel <= targetUserLevel && authResult.user.id !== targetUser.id) {
      return Response.json(
        { 
          error: "Sin permisos suficientes", 
          reason: "INSUFFICIENT_PERMISSIONS",
          details: "No puedes modificar usuarios de tu mismo nivel o superior"
        },
        { status: 403 }
      )
    }

    const allowedUpdates: any = {}
    
    if (typeof body.isActive === 'boolean') {
      allowedUpdates.isActive = body.isActive
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return Response.json(
        { error: "No hay campos válidos para actualizar", reason: "NO_VALID_FIELDS" },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: allowedUpdates,
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        updatedAt: true
      }
    })

    console.log(`✅ [USER_UPDATE] User ${userId} updated successfully by ${authResult.user?.email}`)

    return Response.json({
      success: true,
      user: updatedUser,
      message: "Usuario actualizado correctamente"
    })

  } catch (error) {
    console.error("❌ [USER_UPDATE] Error:", error)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}