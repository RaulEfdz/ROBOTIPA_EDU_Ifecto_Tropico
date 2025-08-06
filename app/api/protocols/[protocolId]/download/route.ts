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

    const protocol = await db.protocol.findUnique({
      where: { id: protocolId },
      include: {
        protocolAccess: {
          where: { userId: user.id }
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
    const hasAccess = 
      protocol.isPublic || 
      protocol.authorId === user.id || 
      user.customRole === "admin" ||
      protocol.protocolAccess.some(access => 
        access.accessType === "download" && 
        (!access.expiresAt || access.expiresAt > new Date())
      )

    if (!hasAccess) {
      return NextResponse.json({ error: "Download access denied" }, { status: 403 })
    }

    // Incrementar contador de descargas
    await db.protocol.update({
      where: { id: protocolId },
      data: {
        downloads: {
          increment: 1
        }
      }
    })

    // Si el protocolo tiene archivo adjunto, devolver la URL
    if (protocol.fileUrl) {
      return NextResponse.json({
        downloadUrl: protocol.fileUrl,
        fileName: protocol.fileName || `${protocol.title}.pdf`
      })
    }

    // Si no tiene archivo, generar PDF del contenido
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${protocol.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          .meta { color: #666; margin-bottom: 20px; }
          .content { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>${protocol.title}</h1>
        <div class="meta">
          <p><strong>Tipo:</strong> ${protocol.type}</p>
          <p><strong>Versión:</strong> ${protocol.version}</p>
          <p><strong>Autor:</strong> ${protocol.authorId}</p>
          <p><strong>Fecha:</strong> ${protocol.createdAt.toLocaleDateString()}</p>
        </div>
        ${protocol.description ? `<div class="description"><p>${protocol.description}</p></div>` : ''}
        <div class="content">
          ${protocol.content}
        </div>
      </body>
      </html>
    `

    return NextResponse.json({
      htmlContent: content,
      fileName: `${protocol.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`
    })

  } catch (error) {
    console.error("[PROTOCOL_DOWNLOAD]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}