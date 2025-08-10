// Script para diagnosticar el problema con profesores
import { db } from "../lib/db"

async function debugTeachers() {
  try {
    console.log("🔍 DIAGNÓSTICO DE PROFESORES")
    console.log("=" * 50)

    // 1. Ver todos los usuarios y sus roles
    console.log("\n📊 TODOS LOS USUARIOS:")
    const allUsers = await db.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        customRole: true,
        isActive: true
      }
    })

    console.table(allUsers)

    // 2. Ver profesores por string "teacher"
    console.log("\n👨‍🏫 BÚSQUEDA POR customRole = 'teacher':")
    const teachersByString = await db.user.findMany({
      where: { customRole: "teacher" },
      select: {
        id: true,
        fullName: true,
        email: true,
        customRole: true
      }
    })
    
    console.log(`Encontrados: ${teachersByString.length}`)
    console.table(teachersByString)

    // 3. Ver disponibilidad de profesores
    console.log("\n⏰ DISPONIBILIDAD DE PROFESORES:")
    const availability = await db.teacherAvailability.findMany({
      include: {
        teacher: {
          select: {
            fullName: true,
            email: true,
            customRole: true
          }
        }
      }
    })

    console.log(`Registros de disponibilidad: ${availability.length}`)
    console.table(availability.map(a => ({
      teacher: a.teacher.fullName,
      email: a.teacher.email,
      role: a.teacher.customRole,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      isActive: a.isActive
    })))

    // 4. Ver valores de las variables de entorno
    console.log("\n🔧 VARIABLES DE ENTORNO:")
    console.log("TEACHER_ID:", process.env.TEACHER_ID)
    console.log("STUDENT_ID:", process.env.STUDENT_ID)
    console.log("ADMIN_ID:", process.env.ADMIN_ID)

    // 5. Buscar usuarios con roles UUID
    if (process.env.TEACHER_ID) {
      console.log("\n🎯 BÚSQUEDA POR UUID TEACHER_ID:")
      const teachersByUUID = await db.user.findMany({
        where: { customRole: process.env.TEACHER_ID },
        select: {
          id: true,
          fullName: true,
          email: true,
          customRole: true
        }
      })
      
      console.log(`Encontrados por UUID: ${teachersByUUID.length}`)
      console.table(teachersByUUID)
    }

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  debugTeachers()
}

export { debugTeachers }