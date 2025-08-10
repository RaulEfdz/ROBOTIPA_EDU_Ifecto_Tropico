// Script para corregir los roles de usuario en la base de datos
import { db } from "../lib/db"

async function fixUserRoles() {
  try {
    console.log("🔧 CORRIGIENDO ROLES DE USUARIOS")
    console.log("=" * 40)

    // Roles correctos según variables de entorno
    const STUDENT_ROLE_ID = "ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef"
    const TEACHER_ROLE_ID = "ee2b5a3e-5f7d-4e93-9f32-6c833d6f7d02"
    const VISITOR_ROLE_ID = "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8"

    console.log("📋 ROLES CORRECTOS:")
    console.log("Student role:", STUDENT_ROLE_ID)
    console.log("Teacher role:", TEACHER_ROLE_ID)
    console.log("Visitor role:", VISITOR_ROLE_ID)

    // 1. Corregir estudiante@robotipa.com (actualmente tiene visitor role)
    console.log("\n🔄 Corrigiendo estudiante@robotipa.com...")
    const studentUpdate = await db.user.update({
      where: { email: "estudiante@robotipa.com" },
      data: { customRole: STUDENT_ROLE_ID }
    })
    console.log("✅ Estudiante corregido:", studentUpdate.email, "→", studentUpdate.customRole)

    // 2. Verificar profesor@robotipa.com (debería tener teacher role)
    console.log("\n🔍 Verificando profesor@robotipa.com...")
    const teacher = await db.user.findFirst({
      where: { email: "profesor@robotipa.com" }
    })
    
    if (teacher) {
      if (teacher.customRole === TEACHER_ROLE_ID) {
        console.log("✅ Profesor ya tiene el rol correcto:", teacher.customRole)
      } else {
        console.log("🔄 Corrigiendo profesor...")
        const teacherUpdate = await db.user.update({
          where: { email: "profesor@robotipa.com" },
          data: { customRole: TEACHER_ROLE_ID }
        })
        console.log("✅ Profesor corregido:", teacherUpdate.email, "→", teacherUpdate.customRole)
      }
    }

    // 3. Mostrar estado final
    console.log("\n📊 ESTADO FINAL DE USUARIOS:")
    const users = await db.user.findMany({
      select: {
        email: true,
        customRole: true,
        fullName: true
      }
    })

    users.forEach(user => {
      let roleName = "unknown"
      if (user.customRole === STUDENT_ROLE_ID) roleName = "STUDENT"
      if (user.customRole === TEACHER_ROLE_ID) roleName = "TEACHER"
      if (user.customRole === VISITOR_ROLE_ID) roleName = "VISITOR"
      
      console.log(`${user.email} → ${roleName} (${user.customRole})`)
    })

    console.log("\n🎉 ¡Roles corregidos exitosamente!")
    
  } catch (error) {
    console.error("❌ Error corrigiendo roles:", error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  fixUserRoles()
}

export { fixUserRoles }