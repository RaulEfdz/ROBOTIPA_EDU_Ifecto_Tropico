import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"

export async function POST(
  req: NextRequest,
  { params }: { params: { protocolId: string } }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { protocolId } = params
    const body = await req.json()
    const { userId, accessType = "view", expiresAt } = body

    // Solo admins y el autor del protocolo pueden otorgar acceso
    const protocol = await db.protocol.findUnique({
      where: { id: protocolId },
      select: { authorId: true, isPublic: true }
    })

    if (!protocol) {
      return NextResponse.json(
        { error: "Protocol not found" },
        { status: 404 }
      )
    }

    if (protocol.authorId !== user.id && user.customRole !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Verificar que el usuario existe
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      )
    }

    // Crear o actualizar el acceso
    const protocolAccess = await db.protocolAccess.upsert({
      where: {
        userId_protocolId: {
          userId,
          protocolId
        }
      },
      update: {
        accessType,
        grantedBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      create: {
        userId,
        protocolId,
        accessType,
        grantedBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(protocolAccess, { status: 201 })

  } catch (error) {
    console.error("[PROTOCOL_ACCESS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { protocolId: string } }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { protocolId } = params

    // Verificar que el protocolo existe y el usuario tiene permisos para ver los accesos
    const protocol = await db.protocol.findUnique({
      where: { id: protocolId },
      select: { authorId: true }
    })

    if (!protocol) {
      return NextResponse.json(
        { error: "Protocol not found" },
        { status: 404 }
      )
    }

    if (protocol.authorId !== user.id && user.customRole !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const accesses = await db.protocolAccess.findMany({
      where: { protocolId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { grantedAt: "desc" }
    })

    return NextResponse.json(accesses)

  } catch (error) {
    console.error("[PROTOCOL_ACCESS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { protocolId: string } }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { protocolId } = params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Verificar permisos
    const protocol = await db.protocol.findUnique({
      where: { id: protocolId },
      select: { authorId: true }
    })

    if (!protocol) {
      return NextResponse.json(
        { error: "Protocol not found" },
        { status: 404 }
      )
    }

    if (protocol.authorId !== user.id && user.customRole !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await db.protocolAccess.delete({
      where: {
        userId_protocolId: {
          userId,
          protocolId
        }
      }
    })

    return NextResponse.json({ message: "Access revoked successfully" })

  } catch (error) {
    console.error("[PROTOCOL_ACCESS_DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}