import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"
import { ProtocolType, ProtocolStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const categoryId = searchParams.get("categoryId")
    const type = searchParams.get("type") as ProtocolType
    const status = searchParams.get("status") as ProtocolStatus
    const isPublic = searchParams.get("isPublic")
    const authorId = searchParams.get("authorId")
    const sortBy = searchParams.get("sortBy") || "order"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const featured = searchParams.get("featured")
    const pinned = searchParams.get("pinned")

    const protocols = await db.protocol.findMany({
      where: {
        AND: [
          courseId ? { courseId } : {},
          categoryId ? { categoryId } : {},
          type ? { type } : {},
          status ? { status } : {},
          isPublic !== null ? { isPublic: isPublic === "true" } : {},
          authorId ? { authorId } : {},
          featured !== null ? { isFeatured: featured === "true" } : {},
          pinned !== null ? { isPinned: pinned === "true" } : {},
          // Si no es admin, solo mostrar protocolos públicos o propios
          user.customRole !== "admin" 
            ? {
                OR: [
                  { isPublic: true },
                  { authorId: user.id }
                ]
              }
            : {}
        ]
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
      },
      orderBy: [
        // Pinned items first
        { isPinned: "desc" },
        // Then featured items  
        { isFeatured: "desc" },
        // Then by selected sort
        ...(sortBy === "course" 
          ? [{ course: { title: sortOrder as any } }] 
          : sortBy === "category"
          ? [{ category: { name: sortOrder as any } }]
          : sortBy === "author"
          ? [{ author: { fullName: sortOrder as any } }]
          : [{ [sortBy]: sortOrder as any }]
        )
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json(protocols)

  } catch (error) {
    console.error("[PROTOCOLS_GET]", error)
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

    // Solo profesores y admins pueden crear protocolos
    if (!["teacher", "admin"].includes(user.customRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      content,
      type,
      courseId,
      categoryId,
      tags,
      isPublic,
      fileUrl,
      fileName,
      fileSize
    } = body

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "Title, content and type are required" },
        { status: 400 }
      )
    }

    // Validar que el curso pertenece al usuario (si se especifica)
    if (courseId) {
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

    const protocol = await db.protocol.create({
      data: {
        title,
        description,
        content,
        type: type as ProtocolType,
        status: ProtocolStatus.draft,
        courseId,
        categoryId,
        authorId: user.id,
        tags: tags || [],
        isPublic: isPublic || false,
        fileUrl,
        fileName,
        fileSize
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

    return NextResponse.json(protocol, { status: 201 })

  } catch (error) {
    console.error("[PROTOCOLS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}