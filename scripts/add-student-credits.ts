// Script para agregar créditos a estudiantes para testing
import { db } from "../lib/db"

async function addCreditsToAllUsers() {
  try {
    console.log("🔄 Agregando 10 créditos a todos los usuarios para testing...")

    const users = await db.user.findMany({
      select: { id: true, email: true, fullName: true }
    })

    for (const user of users) {
      // Crear o actualizar créditos del usuario
      const studentCredits = await db.studentCredits.upsert({
        where: { userId: user.id },
        update: {
          totalCredits: { increment: 10 },
          remainingCredits: { increment: 10 }
        },
        create: {
          userId: user.id,
          totalCredits: 10,
          usedCredits: 0,
          remainingCredits: 10
        }
      })

      // Crear transacción de bonus
      await db.studentCreditTransaction.create({
        data: {
          creditsId: studentCredits.id,
          type: "bonus",
          amount: 10,
          description: "Créditos de testing - bonus inicial",
          balanceAfter: studentCredits.remainingCredits + 10
        }
      })

      console.log(`✅ Agregados 10 créditos a ${user.fullName} (${user.email})`)
    }

    console.log("🎉 ¡Créditos agregados exitosamente a todos los usuarios!")
    
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  addCreditsToAllUsers()
}

export { addCreditsToAllUsers }