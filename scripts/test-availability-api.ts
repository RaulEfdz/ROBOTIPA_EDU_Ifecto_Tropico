// Script para probar directamente la API de disponibilidad
async function testAvailabilityAPI() {
  try {
    console.log("🧪 PROBANDO API DE DISPONIBILIDAD")
    console.log("=" * 40)

    const teacherId = "30bbadcc-b90c-4349-bc2d-f1ea56b22827" // profesor@robotipa.com
    const testDate = "2025-08-11" // Lunes que debería estar disponible

    console.log(`👨‍🏫 Profesor ID: ${teacherId}`)
    console.log(`📅 Fecha de prueba: ${testDate}`)

    // 1. Probar disponibilidad general (sin fecha)
    console.log("\n1️⃣ DISPONIBILIDAD GENERAL:")
    const generalResponse = await fetch(`http://localhost:3000/api/live-sessions/availability?teacherId=${teacherId}`)
    
    if (!generalResponse.ok) {
      console.error(`❌ Error general: ${generalResponse.status} ${generalResponse.statusText}`)
      const errorText = await generalResponse.text()
      console.error("Error details:", errorText)
    } else {
      const generalData = await generalResponse.json()
      console.log("✅ Disponibilidad general:", JSON.stringify(generalData, null, 2))
    }

    // 2. Probar disponibilidad para fecha específica
    console.log(`\n2️⃣ DISPONIBILIDAD PARA ${testDate}:`)
    const specificResponse = await fetch(`http://localhost:3000/api/live-sessions/availability?teacherId=${teacherId}&date=${testDate}`)
    
    if (!specificResponse.ok) {
      console.error(`❌ Error específico: ${specificResponse.status} ${specificResponse.statusText}`)
      const errorText = await specificResponse.text()
      console.error("Error details:", errorText)
    } else {
      const specificData = await specificResponse.json()
      console.log("✅ Slots disponibles:", JSON.stringify(specificData, null, 2))
      console.log(`📊 Total slots: ${specificData.length}`)
    }

    // 3. Verificar el día de la semana del testDate
    const testDateObj = new Date(testDate + "T00:00:00")
    const dayOfWeek = testDateObj.getDay()
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    console.log(`\n📆 ${testDate} es ${dayNames[dayOfWeek]} (dayOfWeek: ${dayOfWeek})`)

  } catch (error) {
    console.error("❌ Test Error:", error)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testAvailabilityAPI()
}

export { testAvailabilityAPI }