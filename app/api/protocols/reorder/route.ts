import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Solo profesores y admins pueden reordenar protocolos
    if (!["teacher", "admin"].includes(user.customRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { protocolOrders } = body

    if (!protocolOrders || !Array.isArray(protocolOrders)) {
      return NextResponse.json(
        { error: "protocolOrders array is required" },
        { status: 400 }
      )
    }

    // Validate that all protocols belong to the user (if not admin)
    if (user.customRole !== "admin") {
      const protocolIds = protocolOrders.map(p => p.id)
      const userProtocols = await db.protocol.findMany({
        where: {
          id: { in: protocolIds },
          authorId: user.id
        },
        select: { id: true }
      })

      if (userProtocols.length !== protocolIds.length) {
        return NextResponse.json(
          { error: "You can only reorder your own protocols" },
          { status: 403 }
        )
      }
    }

    // Update order for each protocol
    const updatePromises = protocolOrders.map(({ id, order }) =>
      db.protocol.update({
        where: { id },
        data: { 
          order,
          updatedAt: new Date()
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("[PROTOCOLS_REORDER]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}