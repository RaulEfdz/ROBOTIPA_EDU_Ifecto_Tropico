import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { SessionStatus, SessionType } from "@prisma/client"

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

    // Filtrar por rol de usuario
    if (user.customRole === "teacher") {
      where.AND.push({ teacherId: user.id })
    } else if (user.customRole === "student") {
      where.AND.push({ studentId: user.id })
    }
    // Admin puede ver todas las sesiones

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
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
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
      return NextResponse.json(
        { error: "Title, teacher, scheduled time and duration are required" },
        { status: 400 }
      )
    }

    // Verificar que el profesor existe y está activo
    const teacher = await db.user.findFirst({
      where: {
        id: teacherId,
        customRole: "teacher",
        isActive: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found or inactive" },
        { status: 404 }
      )
    }

    // Si es estudiante, verificar créditos
    if (user.customRole === "student") {
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

    const session = await db.liveSession.create({
      data: {
        title,
        description,
        type: type as SessionType || SessionType.consultation,
        teacherId,
        studentId: user.customRole === "student" ? user.id : body.studentId,
        scheduledAt: scheduledDate,
        duration,
        timeZone: timeZone || "America/Panama",
        courseId,
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
    if (user.customRole === "student") {
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

    return NextResponse.json(session, { status: 201 })

  } catch (error) {
    console.error("[LIVE_SESSIONS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}