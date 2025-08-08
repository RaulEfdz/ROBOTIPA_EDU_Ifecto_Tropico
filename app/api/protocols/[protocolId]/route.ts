import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { ProtocolType, ProtocolStatus } from "@prisma/client"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ protocolId: string }> }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    const { protocolId } = await params

    const protocol = await db.protocol.findUnique({
      where: {
        id: protocolId
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            protocolViews: true,
            protocolAccess: true
          }
        }
      }
    })

    if (!protocol) {
      return NextResponse.json(
        { error: "Protocol not found" },
        { status: 404 }
      )
    }

    // Verificar permisos de acceso
    if (!protocol.isPublic && user?.id !== protocol.authorId && user?.customRole !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Registrar vista si hay usuario autenticado
    if (user) {
      // Actualizar contador de vistas
      await db.protocol.update({
        where: { id: protocolId },
        data: {
          views: {
            increment: 1
          }
        }
      })

      // Crear registro de vista
      await db.protocolView.create({
        data: {
          userId: user.id,
          protocolId: protocolId,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown"
        }
      })
    }

    return NextResponse.json(protocol)

  } catch (error) {
    console.error("[PROTOCOL_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ protocolId: string }> }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { protocolId } = await params
    const body = await req.json()

    const existingProtocol = await db.protocol.findUnique({
      where: { id: protocolId }
    })

    if (!existingProtocol) {
      return NextResponse.json(
        { error: "Protocol not found" },
        { status: 404 }
      )
    }

    // Verificar permisos (solo el autor o admin pueden editar)
    if (existingProtocol.authorId !== user.id && user.customRole !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const {
      title,
      description,
      content,
      type,
      status,
      courseId,
      categoryId,
      tags,
      isPublic,
      fileUrl,
      fileName,
      fileSize,
      version
    } = body

    // Validar que el curso pertenece al usuario (si se especifica)
    if (courseId && courseId !== existingProtocol.courseId) {
      const course = await db.course.findFirst({
        where: {
          id: courseId,
          userId: user.id
        }
      })

      if (!course && user.customRole !== "admin") {
        return NextResponse.json(
          { error: "Course not found or access denied" },
          { status: 404 }
        )
      }
    }

    const protocol = await db.protocol.update({
      where: { id: protocolId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(content && { content }),
        ...(type && { type: type as ProtocolType }),
        ...(status && { status: status as ProtocolStatus }),
        ...(courseId !== undefined && { courseId }),
        ...(categoryId !== undefined && { categoryId }),
        ...(tags && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileName !== undefined && { fileName }),
        ...(fileSize !== undefined && { fileSize }),
        ...(version && { version })
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(protocol)

  } catch (error) {
    console.error("[PROTOCOL_PATCH]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ protocolId: string }> }
) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { protocolId } = await params

    const existingProtocol = await db.protocol.findUnique({
      where: { id: protocolId }
    })

    if (!existingProtocol) {
      return NextResponse.json(
        { error: "Protocol not found" },
        { status: 404 }
      )
    }

    // Solo el autor o admin pueden eliminar
    if (existingProtocol.authorId !== user.id && user.customRole !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await db.protocol.delete({
      where: { id: protocolId }
    })

    return NextResponse.json({ message: "Protocol deleted successfully" })

  } catch (error) {
    console.error("[PROTOCOL_DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}