// Script para diagnosticar el problema de cálculo de fechas
function debugDateCalculation() {
  console.log("🗓️ DIAGNÓSTICO DE CÁLCULO DE FECHAS")
  console.log("=" * 40)

  // Fechas que están causando problema
  const problematicDates = [
    "2025-08-11",
    "2025-08-18", 
    "2025-08-25",
    "2025-09-01",
    "2025-09-08"
  ]

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  console.log("\n📅 ANÁLISIS DE FECHAS:")
  console.table(problematicDates.map(dateStr => {
    // Método 1: new Date(dateStr) - Lo que usa el backend
    const date1 = new Date(dateStr)
    
    // Método 2: new Date(dateStr + "T00:00:00") - Más explícito
    const date2 = new Date(dateStr + "T00:00:00")
    
    // Método 3: Parsing manual
    const [year, month, day] = dateStr.split('-').map(Number)
    const date3 = new Date(year, month - 1, day)
    
    return {
      dateString: dateStr,
      method1_dayOfWeek: date1.getDay(),
      method1_dayName: dayNames[date1.getDay()],
      method1_utc: date1.toISOString().split('T')[0],
      method2_dayOfWeek: date2.getDay(),
      method2_dayName: dayNames[date2.getDay()],
      method3_dayOfWeek: date3.getDay(),
      method3_dayName: dayNames[date3.getDay()],
    }
  }))

  // Verificar zona horaria
  console.log("\n⏰ INFORMACIÓN DE ZONA HORARIA:")
  console.log("Timezone offset:", new Date().getTimezoneOffset())
  console.log("Local timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone)
  
  // Probar el cálculo que hace el frontend
  console.log("\n🖥️ SIMULACIÓN DEL FRONTEND:")
  const today = new Date()
  console.log("Fecha actual:", today.toISOString().split('T')[0], "dayOfWeek:", today.getDay())
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date()
    date.setDate(today.getDate() + i)
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 1) { // Lunes
      console.log(`Día ${i}: ${date.toISOString().split('T')[0]} = ${dayNames[dayOfWeek]} (${dayOfWeek})`)
    }
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  debugDateCalculation()
}

export { debugDateCalculation }