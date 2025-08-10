// Script para probar el API de profesores
import { getTeacherId, translateRole } from "../utils/roles/translate"

async function testTeachersAPI() {
  try {
    console.log("🧪 PROBANDO API DE PROFESORES")
    console.log("=" * 40)

    // 1. Verificar función translateRole
    console.log("\n🔧 Función translateRole:")
    const teacherUUID = getTeacherId()
    console.log("Teacher UUID:", teacherUUID)
    
    try {
      const teacherName = translateRole(teacherUUID)
      console.log("Teacher name:", teacherName)
    } catch (error) {
      console.error("Error translating UUID to name:", error)
    }

    try {
      const teacherIdFromName = translateRole("teacher")
      console.log("Teacher ID from 'teacher':", teacherIdFromName)
    } catch (error) {
      console.error("Error translating 'teacher' to UUID:", error)
    }

    // 2. Hacer request al API
    console.log("\n📡 Haciendo request a /api/users/teachers...")
    
    const response = await fetch("http://localhost:3000/api/users/teachers")
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error("Error details:", errorText)
      return
    }

    const data = await response.json()
    console.log("✅ API Response:", JSON.stringify(data, null, 2))

  } catch (error) {
    console.error("❌ Test Error:", error)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testTeachersAPI()
}

export { testTeachersAPI }