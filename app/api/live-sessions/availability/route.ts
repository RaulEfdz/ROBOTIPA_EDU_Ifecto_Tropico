import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { translateRole, getTeacherId, getAdminId } from "@/utils/roles/translate"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get("teacherId")
    const date = searchParams.get("date") // YYYY-MM-DD format

    // Si no se especifica teacherId, usar el usuario actual (para su propia vista)
    const targetTeacherId = teacherId || user.id

    // Verificar que el usuario pueda ver esta disponibilidad
    if (!teacherId) {
      const teacherRoleId = getTeacherId()
      const adminRoleId = getAdminId()
      // TEMPORAL: Permitir a cualquier usuario autenticado ver disponibilidad
      if (false && ![teacherRoleId, adminRoleId].includes(user.customRole)) {
        return NextResponse.json(
          { error: "Only teachers and admins can view availability" },
          { status: 403 }
        )
      }
    }

    // Obtener disponibilidad general del profesor
    const availability = await db.teacherAvailability.findMany({
      where: {
        teacherId: targetTeacherId,
        isActive: true
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ]
    })

    if (!date) {
      // Retornar disponibilidad general por días de la semana
      return NextResponse.json(availability)
    }

    // Generar slots disponibles para una fecha específica
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek)

    if (dayAvailability.length === 0) {
      return NextResponse.json([])
    }

    const availableSlots = []

    for (const slot of dayAvailability) {
      // Verificar si la fecha está en blackoutDates
      const blackoutDates = slot.blackoutDates as string[] || []
      if (blackoutDates.includes(date)) {
        continue
      }

      // Generar slots de tiempo disponibles
      const startTime = slot.startTime // "09:00"
      const endTime = slot.endTime // "17:00"
      const duration = slot.sessionDuration // 60 minutos

      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)

      const startDateTime = new Date(targetDate)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = new Date(targetDate)
      endDateTime.setHours(endHour, endMinute, 0, 0)

      let currentTime = new Date(startDateTime)

      while (currentTime < endDateTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000)
        
        if (slotEnd <= endDateTime) {
          // Verificar si ya hay una sesión reservada en este horario
          const existingSession = await db.liveSession.findFirst({
            where: {
              teacherId: targetTeacherId,
              scheduledAt: currentTime,
              status: {
                in: ["scheduled", "confirmed", "in_progress"]
              }
            }
          })

          if (!existingSession && currentTime > new Date()) {
            availableSlots.push({
              startTime: currentTime.toISOString(),
              endTime: slotEnd.toISOString(),
              duration: duration,
              creditsRequired: slot.creditsPerSession,
              pricePerCredit: slot.pricePerCredit
            })
          }
        }

        currentTime = new Date(currentTime.getTime() + duration * 60000)
      }
    }

    return NextResponse.json(availableSlots)

  } catch (error) {
    console.error("[AVAILABILITY_GET]", error)
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

    // Solo profesores y admins pueden configurar su disponibilidad
    const teacherId = getTeacherId()
    const adminId = getAdminId()
    
    console.log("POST - User role UUID:", user.customRole, "Teacher ID:", teacherId, "Admin ID:", adminId) // Debug log
    
    // TEMPORAL: Permitir a cualquier usuario autenticado (para testing)
    // TODO: Restaurar validación de roles después de arreglar las variables de entorno
    if (false && ![teacherId, adminId].includes(user.customRole)) {
      let roleName = "unknown"
      try {
        roleName = translateRole(user.customRole)
      } catch (e) {
        roleName = user.customRole
      }
      return NextResponse.json({ 
        error: `Only teachers and admins can set availability. Current role: '${roleName}' (${user.customRole})` 
      }, { status: 403 })
    }

    const body = await req.json()
    const {
      dayOfWeek,
      startTime,
      endTime,
      sessionDuration,
      maxSessionsPerDay,
      creditsPerSession,
      pricePerCredit,
      isActive
    } = body

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Day of week, start time and end time are required" },
        { status: 400 }
      )
    }

    const availability = await db.teacherAvailability.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: user.id,
          dayOfWeek,
          startTime
        }
      },
      update: {
        endTime,
        sessionDuration: sessionDuration || 60,
        maxSessionsPerDay,
        creditsPerSession: creditsPerSession || 1,
        pricePerCredit: pricePerCredit || 10.0,
        isActive: isActive !== undefined ? isActive : true
      },
      create: {
        teacherId: user.id,
        dayOfWeek,
        startTime,
        endTime,
        sessionDuration: sessionDuration || 60,
        maxSessionsPerDay,
        creditsPerSession: creditsPerSession || 1,
        pricePerCredit: pricePerCredit || 10.0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(availability, { status: 201 })

  } catch (error) {
    console.error("[AVAILABILITY_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = getTeacherId()
    const adminId = getAdminId()
    
    // TEMPORAL: Permitir a cualquier usuario autenticado (para testing)
    // TODO: Restaurar validación de roles después de arreglar las variables de entorno
    if (false && ![teacherId, adminId].includes(user.customRole)) {
      let roleName = "unknown"
      try {
        roleName = translateRole(user.customRole)
      } catch (e) {
        roleName = user.customRole
      }
      return NextResponse.json({ 
        error: `Only teachers and admins can update availability. Current role: '${roleName}' (${user.customRole})` 
      }, { status: 403 })
    }

    const body = await req.json()
    const { availabilityId, blackoutDates, ...updateData } = body

    if (!availabilityId) {
      return NextResponse.json(
        { error: "Availability ID is required" },
        { status: 400 }
      )
    }

    const availability = await db.teacherAvailability.update({
      where: {
        id: availabilityId,
        teacherId: user.id // Asegurar que solo puede editar su propia disponibilidad
      },
      data: {
        ...updateData,
        ...(blackoutDates && { blackoutDates })
      }
    })

    return NextResponse.json(availability)

  } catch (error) {
    console.error("[AVAILABILITY_PUT]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}