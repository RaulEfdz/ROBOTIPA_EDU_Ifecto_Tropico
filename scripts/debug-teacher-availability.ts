// Script para diagnosticar la disponibilidad específica del profesor
import { db } from "../lib/db"

async function debugTeacherAvailability() {
  try {
    console.log("🔍 DIAGNÓSTICO DE DISPONIBILIDAD DEL PROFESOR")
    console.log("=" * 50)

    // 1. Ver el profesor específico y su disponibilidad
    const teacherId = "30bbadcc-b90c-4349-bc2d-f1ea56b22827" // profesor@robotipa.com
    
    const teacher = await db.user.findUnique({
      where: { id: teacherId },
      include: {
        teacherAvailability: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!teacher) {
      console.log("❌ Profesor no encontrado")
      return
    }

    console.log("\n👨‍🏫 PROFESOR:")
    console.log(`Nombre: ${teacher.fullName}`)
    console.log(`Email: ${teacher.email}`)
    console.log(`ID: ${teacher.id}`)

    console.log("\n📅 DISPONIBILIDAD REGISTRADA:")
    console.table(teacher.teacherAvailability.map(a => ({
      id: a.id,
      dayOfWeek: a.dayOfWeek,
      dayName: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][a.dayOfWeek],
      startTime: a.startTime,
      endTime: a.endTime,
      isActive: a.isActive,
      isRecurring: a.isRecurring,
      createdAt: a.createdAt.toISOString().split('T')[0]
    })))

    // 2. Verificar lógica de cálculo manual
    console.log("\n🧮 SIMULACIÓN DE CÁLCULO DE FECHAS:")
    const today = new Date()
    console.log(`Fecha actual: ${today.toISOString().split('T')[0]} (${today.getDay()})`)

    const availableDays = teacher.teacherAvailability
      .filter(a => a.isActive)
      .map(a => a.dayOfWeek)

    console.log(`Días de semana disponibles: ${availableDays} (${availableDays.map(d => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')})`)

    // 3. Calcular próximas fechas disponibles (30 días)
    const nextDates = []
    for (let i = 1; i <= 30; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      
      const dayOfWeek = date.getDay()
      if (availableDays.includes(dayOfWeek)) {
        nextDates.push({
          date: date.toISOString().split('T')[0],
          dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek],
          dayOfWeek
        })
      }
    }

    console.log(`\n📆 PRÓXIMAS FECHAS CALCULADAS (${nextDates.length} fechas):`)
    console.table(nextDates)

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  debugTeacherAvailability()
}

export { debugTeacherAvailability }