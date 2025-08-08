import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { SessionStatus } from "@prisma/client"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
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

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Verificar permisos
    const hasAccess = 
      session.teacherId === user.id ||
      session.studentId === user.id ||
      user.customRole === "admin"

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(session)

  } catch (error) {
    console.error("[SESSION_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params
    const body = await req.json()

    const existingSession = await db.liveSession.findUnique({
      where: { id: sessionId }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Verificar permisos
    const canEdit = 
      existingSession.teacherId === user.id ||
      existingSession.studentId === user.id ||
      user.customRole === "admin"

    if (!canEdit) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const {
      status,
      meetingUrl,
      meetingId,
      meetingPasscode,
      recordingUrl,
      teacherNotes,
      studentNotes,
      privateNotes,
      rating,
      feedback,
      scheduledAt,
      duration
    } = body

    // Validaciones según el rol
    const updateData: any = {}

    if (status && Object.values(SessionStatus).includes(status)) {
      updateData.status = status
    }

    // Solo el profesor puede actualizar datos de la reunión y notas privadas
    if (existingSession.teacherId === user.id) {
      if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl
      if (meetingId !== undefined) updateData.meetingId = meetingId
      if (meetingPasscode !== undefined) updateData.meetingPasscode = meetingPasscode
      if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl
      if (teacherNotes !== undefined) updateData.teacherNotes = teacherNotes
      if (privateNotes !== undefined) updateData.privateNotes = privateNotes
      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt)
      if (duration !== undefined) updateData.duration = duration
    }

    // Solo el estudiante puede actualizar sus notas y calificación
    if (existingSession.studentId === user.id) {
      if (studentNotes !== undefined) updateData.studentNotes = studentNotes
      if (rating !== undefined && rating >= 1 && rating <= 5) updateData.rating = rating
      if (feedback !== undefined) updateData.feedback = feedback
    }

    // Los admins pueden actualizar todo
    if (user.customRole === "admin") {
      Object.assign(updateData, body)
      if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
    }

    const session = await db.liveSession.update({
      where: { id: sessionId },
      data: updateData,
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

    return NextResponse.json(session)

  } catch (error) {
    console.error("[SESSION_PATCH]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const existingSession = await db.liveSession.findUnique({
      where: { id: sessionId }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Solo el estudiante o admin pueden cancelar
    const canCancel = 
      existingSession.studentId === user.id ||
      user.customRole === "admin"

    if (!canCancel) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // No permitir cancelar sesiones que ya empezaron
    if (["in_progress", "completed"].includes(existingSession.status)) {
      return NextResponse.json(
        { error: "Cannot cancel session that is in progress or completed" },
        { status: 400 }
      )
    }

    // Refundar créditos si la cancelación es con tiempo suficiente
    const now = new Date()
    const sessionTime = existingSession.scheduledAt
    const hoursUntilSession = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let shouldRefund = false
    if (hoursUntilSession >= 24) {
      shouldRefund = true
    } else if (hoursUntilSession >= 2) {
      shouldRefund = true // Refund parcial o completo según política
    }

    if (shouldRefund && existingSession.creditsRequired > 0) {
      // Refundar créditos
      const studentCredits = await db.studentCredits.findFirst({
        where: { userId: existingSession.studentId }
      })

      if (studentCredits) {
        await db.studentCredits.update({
          where: { id: studentCredits.id },
          data: {
            usedCredits: { decrement: existingSession.creditsRequired },
            remainingCredits: { increment: existingSession.creditsRequired }
          }
        })

        // Crear transacción de refund
        await db.studentCreditTransaction.create({
          data: {
            creditsId: studentCredits.id,
            type: "refund",
            amount: existingSession.creditsRequired,
            description: `Refund por cancelación de sesión: ${existingSession.title}`,
            sessionId: existingSession.id,
            balanceAfter: studentCredits.remainingCredits + existingSession.creditsRequired
          }
        })
      }
    }

    // Marcar como cancelada en lugar de eliminar
    const session = await db.liveSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.cancelled,
        studentNotes: shouldRefund 
          ? `Cancelada y créditos refundados (${existingSession.creditsRequired} créditos)`
          : "Cancelada - sin refund por política de cancelación"
      }
    })

    return NextResponse.json({ 
      message: "Session cancelled successfully",
      refunded: shouldRefund,
      creditsRefunded: shouldRefund ? existingSession.creditsRequired : 0
    })

  } catch (error) {
    console.error("[SESSION_DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}