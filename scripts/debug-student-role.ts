// Script para diagnosticar el problema con el rol de estudiante
import { getStudentId, getTeacherId } from "../utils/roles/translate"

function debugStudentRole() {
  console.log("🔍 DIAGNÓSTICO DE ROLES DE USUARIO")
  console.log("=" * 40)

  const studentRoleId = getStudentId()
  const teacherRoleId = getTeacherId()
  
  console.log("📋 ROLES CONFIGURADOS:")
  console.log("Student role ID:", studentRoleId)
  console.log("Teacher role ID:", teacherRoleId)
  
  console.log("\n👤 USUARIO ACTUAL EN LOGS:")
  console.log("estudiante@robotipa.com role:", "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8")
  console.log("profesor@robotipa.com role:", "ee2b5a3e-5f7d-4e93-9f32-6c833d6f7d02")
  
  console.log("\n🔍 COMPARACIONES:")
  console.log("estudiante role === studentRoleId?", "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8" === studentRoleId)
  console.log("profesor role === teacherRoleId?", "ee2b5a3e-5f7d-4e93-9f32-6c833d6f7d02" === teacherRoleId)
  
  console.log("\n📊 VARIABLES DE ENTORNO:")
  console.log("STUDENT_ID:", process.env.STUDENT_ID)
  console.log("NEXT_PUBLIC_STUDENT_ID:", process.env.NEXT_PUBLIC_STUDENT_ID)
  console.log("TEACHER_ID:", process.env.TEACHER_ID)
  console.log("NEXT_PUBLIC_TEACHER_ID:", process.env.NEXT_PUBLIC_TEACHER_ID)
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  debugStudentRole()
}

export { debugStudentRole }