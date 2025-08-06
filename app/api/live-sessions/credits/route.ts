import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { CreditTransactionType } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener o crear créditos del estudiante
    let studentCredits = await db.studentCredits.findFirst({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            session: {
              select: {
                id: true,
                title: true,
                scheduledAt: true
              }
            }
          }
        }
      }
    })

    if (!studentCredits) {
      studentCredits = await db.studentCredits.create({
        data: {
          userId: user.id,
          totalCredits: 0,
          usedCredits: 0,
          remainingCredits: 0
        },
        include: {
          transactions: {
            include: {
              session: {
                select: {
                  id: true,
                  title: true,
                  scheduledAt: true
                }
              }
            }
          }
        }
      })
    }

    return NextResponse.json(studentCredits)

  } catch (error) {
    console.error("[CREDITS_GET]", error)
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

    const body = await req.json()
    const { amount, type, description, paymentId } = body

    if (!amount || !type) {
      return NextResponse.json(
        { error: "Amount and type are required" },
        { status: 400 }
      )
    }

    // Obtener o crear créditos del estudiante
    let studentCredits = await db.studentCredits.findFirst({
      where: { userId: user.id }
    })

    if (!studentCredits) {
      studentCredits = await db.studentCredits.create({
        data: {
          userId: user.id,
          totalCredits: 0,
          usedCredits: 0,
          remainingCredits: 0
        }
      })
    }

    const creditAmount = parseInt(amount)
    let newBalance = studentCredits.remainingCredits

    // Calcular nuevo balance según el tipo de transacción
    switch (type) {
      case "purchase":
      case "bonus":
        newBalance += creditAmount
        await db.studentCredits.update({
          where: { id: studentCredits.id },
          data: {
            totalCredits: { increment: creditAmount },
            remainingCredits: { increment: creditAmount }
          }
        })
        break

      case "usage":
        if (studentCredits.remainingCredits < creditAmount) {
          return NextResponse.json(
            { error: "Insufficient credits" },
            { status: 400 }
          )
        }
        newBalance -= creditAmount
        await db.studentCredits.update({
          where: { id: studentCredits.id },
          data: {
            usedCredits: { increment: creditAmount },
            remainingCredits: { decrement: creditAmount }
          }
        })
        break

      case "refund":
        newBalance += creditAmount
        await db.studentCredits.update({
          where: { id: studentCredits.id },
          data: {
            usedCredits: { decrement: Math.min(creditAmount, studentCredits.usedCredits) },
            remainingCredits: { increment: creditAmount }
          }
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid transaction type" },
          { status: 400 }
        )
    }

    // Crear transacción
    const transaction = await db.studentCreditTransaction.create({
      data: {
        creditsId: studentCredits.id,
        type: type as CreditTransactionType,
        amount: type === "usage" ? -creditAmount : creditAmount,
        description: description || `${type} de ${creditAmount} crédito(s)`,
        paymentId,
        balanceAfter: newBalance
      }
    })

    // Obtener créditos actualizados
    const updatedCredits = await db.studentCredits.findFirst({
      where: { id: studentCredits.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    })

    return NextResponse.json({
      credits: updatedCredits,
      transaction
    }, { status: 201 })

  } catch (error) {
    console.error("[CREDITS_POST]", error)
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

    const body = await req.json()
    const { autoRecharge, rechargeThreshold, rechargeAmount } = body

    const studentCredits = await db.studentCredits.upsert({
      where: { userId: user.id },
      update: {
        autoRecharge: autoRecharge !== undefined ? autoRecharge : undefined,
        rechargeThreshold: rechargeThreshold !== undefined ? rechargeThreshold : undefined,
        rechargeAmount: rechargeAmount !== undefined ? rechargeAmount : undefined
      },
      create: {
        userId: user.id,
        totalCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        autoRecharge: autoRecharge || false,
        rechargeThreshold: rechargeThreshold || 5,
        rechargeAmount: rechargeAmount || 10
      }
    })

    return NextResponse.json(studentCredits)

  } catch (error) {
    console.error("[CREDITS_PUT]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}