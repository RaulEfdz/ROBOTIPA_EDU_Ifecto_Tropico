import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { SessionStatus, SessionType } from "@prisma/client"
import { translateRole, getTeacherId, getStudentId } from "@/utils/roles/translate"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as SessionStatus
    const type = searchParams.get("type") as SessionType
    const teacherId = searchParams.get("teacherId")
    const studentId = searchParams.get("studentId")
    const courseId = searchParams.get("courseId")
    const upcoming = searchParams.get("upcoming") === "true"

    const where: any = {
      AND: [
        status ? { status } : {},
        type ? { type } : {},
        teacherId ? { teacherId } : {},
        studentId ? { studentId } : {},
        courseId ? { courseId } : {},
        upcoming ? { 
          scheduledAt: { 
            gte: new Date() 
          },
          status: {
            in: ["scheduled", "confirmed"]
          }
        } : {}
      ]
    }

    // Filtrar por rol de usuario usando translateRole para mayor seguridad
    let userRoleName = "unknown"
    try {
      userRoleName = translateRole(user.customRole)
      console.log("🔍 [LIVE_SESSIONS_GET] User role:", userRoleName, "for user:", user.email)
    } catch (error) {
      console.log("⚠️ [LIVE_SESSIONS_GET] Could not translate role:", user.customRole)
    }
    
    if (userRoleName === "teacher") {
      where.AND.push({ teacherId: user.id })
      console.log("👨‍🏫 [LIVE_SESSIONS_GET] Filtering sessions for teacher:", user.id)
    } else if (userRoleName === "student") {
      where.AND.push({ studentId: user.id })
      console.log("👨‍🎓 [LIVE_SESSIONS_GET] Filtering sessions for student:", user.id)
    } else if (userRoleName === "admin") {
      console.log("👤 [LIVE_SESSIONS_GET] Admin can see all sessions")
      // Admin puede ver todas las sesiones
    } else {
      console.log("🚫 [LIVE_SESSIONS_GET] Unknown role, no sessions visible")
      // Rol desconocido, no puede ver ninguna sesión
      where.AND.push({ id: "never-exists" })
    }

    const sessions = await db.liveSession.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        student: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        scheduledAt: "desc"
      }
    })

    return NextResponse.json(sessions)

  } catch (error) {
    console.error("[LIVE_SESSIONS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 [LIVE_SESSIONS_POST] Starting session creation request")
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      console.log("❌ [LIVE_SESSIONS_POST] No user found - Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log("✅ [LIVE_SESSIONS_POST] User authenticated:", user.email, user.customRole)

    // Traducir el rol del usuario
    let userRoleName = "unknown"
    try {
      userRoleName = translateRole(user.customRole)
      console.log("🔍 [LIVE_SESSIONS_POST] User role name:", userRoleName)
    } catch (error) {
      console.log("⚠️ [LIVE_SESSIONS_POST] Could not translate role:", user.customRole)
    }

    const body = await req.json()
    console.log("📋 [LIVE_SESSIONS_POST] Request body:", body)
    
    const {
      title,
      description,
      type,
      teacherId,
      scheduledAt,
      duration,
      timeZone,
      courseId,
      creditsRequired
    } = body

    if (!title || !teacherId || !scheduledAt || !duration) {
      console.log("❌ [LIVE_SESSIONS_POST] Missing required fields:", { title: !!title, teacherId: !!teacherId, scheduledAt: !!scheduledAt, duration: !!duration })
      return NextResponse.json(
        { error: "Title, teacher, scheduled time and duration are required" },
        { status: 400 }
      )
    }

    // Verificar que el profesor existe y está activo
    const teacherRoleId = getTeacherId()
    const teacher = await db.user.findFirst({
      where: {
        id: teacherId,
        customRole: teacherRoleId,
        isActive: true
      }
    })
    
    console.log("🔍 [LIVE_SESSIONS_POST] Teacher lookup:", { teacherId, teacherRoleId, found: !!teacher })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found or inactive" },
        { status: 404 }
      )
    }

    // Si es estudiante, verificar créditos
    if (userRoleName === "student") {
      console.log("💳 [LIVE_SESSIONS_POST] Checking student credits")
      const studentCredits = await db.studentCredits.findFirst({
        where: { userId: user.id }
      })

      const requiredCredits = creditsRequired || 1
      if (!studentCredits || studentCredits.remainingCredits < requiredCredits) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 400 }
        )
      }
    }

    // Verificar disponibilidad del profesor en ese horario
    const scheduledDate = new Date(scheduledAt)
    const endTime = new Date(scheduledDate.getTime() + duration * 60000)
    
    const conflictingSessions = await db.liveSession.findMany({
      where: {
        teacherId,
        status: {
          in: ["scheduled", "confirmed", "in_progress"]
        },
        OR: [
          {
            AND: [
              { scheduledAt: { lte: scheduledDate } },
              { scheduledAt: { gte: new Date(scheduledDate.getTime() - 60 * 60000) } } // Dentro de 1 hora
            ]
          }
        ]
      }
    })

    if (conflictingSessions.length > 0) {
      return NextResponse.json(
        { error: "Teacher not available at this time" },
        { status: 409 }
      )
    }

    // Determinar studentId correctamente usando translateRole
    let finalStudentId = null
    
    if (userRoleName === "student") {
      finalStudentId = user.id
      console.log("✅ [LIVE_SESSIONS_POST] User is student, using user.id as studentId")
    } else if (body.studentId) {
      finalStudentId = body.studentId
      console.log("✅ [LIVE_SESSIONS_POST] Using provided studentId:", body.studentId)
    }
    
    if (!finalStudentId) {
      console.log("❌ [LIVE_SESSIONS_POST] No student ID provided - user role:", userRoleName)
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      )
    }
    
    console.log("👤 [LIVE_SESSIONS_POST] Final student ID:", finalStudentId)

    const session = await db.liveSession.create({
      data: {
        title,
        description,
        type: type as SessionType || SessionType.consultation,
        teacherId,
        studentId: finalStudentId,
        scheduledAt: scheduledDate,
        duration,
        timeZone: timeZone || "America/Panama",
        courseId: courseId || null,
        creditsRequired: creditsRequired || 1,
        status: SessionStatus.scheduled
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        student: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Si es estudiante, descontar créditos
    if (userRoleName === "student") {
      console.log("💰 [LIVE_SESSIONS_POST] Deducting student credits")
      await db.studentCredits.update({
        where: { userId: user.id },
        data: {
          usedCredits: { increment: creditsRequired || 1 },
          remainingCredits: { decrement: creditsRequired || 1 }
        }
      })

      // Crear transacción de créditos
      const studentCredits = await db.studentCredits.findFirst({
        where: { userId: user.id }
      })

      if (studentCredits) {
        await db.studentCreditTransaction.create({
          data: {
            creditsId: studentCredits.id,
            type: "usage",
            amount: -(creditsRequired || 1),
            description: `Sesión reservada: ${title}`,
            sessionId: session.id,
            balanceAfter: studentCredits.remainingCredits - (creditsRequired || 1)
          }
        })
      }
    }

    console.log("✅ [LIVE_SESSIONS_POST] Session created successfully:", session.id)
    return NextResponse.json(session, { status: 201 })

  } catch (error) {
    console.error("❌ [LIVE_SESSIONS_POST] Error creating session:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}