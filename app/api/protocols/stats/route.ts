import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const authorId = searchParams.get("authorId")

    // Build where clause based on user role
    const whereClause = user.customRole === "admin" 
      ? (authorId ? { authorId } : {})
      : { authorId: user.id }

    // Get basic counts
    const [
      totalProtocols,
      publishedProtocols,
      draftProtocols,
      protocols
    ] = await Promise.all([
      db.protocol.count({ where: whereClause }),
      db.protocol.count({ 
        where: { ...whereClause, status: "published" } 
      }),
      db.protocol.count({ 
        where: { ...whereClause, status: "draft" } 
      }),
      db.protocol.findMany({
        where: whereClause,
        select: {
          views: true,
          downloads: true,
          rating: true,
          ratingCount: true
        }
      })
    ])

    // Calculate aggregated metrics
    const totalViews = protocols.reduce((sum, p) => sum + p.views, 0)
    const totalDownloads = protocols.reduce((sum, p) => sum + p.downloads, 0)
    
    // Calculate average rating (weighted by rating count)
    const ratingsSum = protocols.reduce((sum, p) => {
      if (p.rating && p.ratingCount > 0) {
        return sum + (p.rating * p.ratingCount)
      }
      return sum
    }, 0)
    
    const totalRatings = protocols.reduce((sum, p) => sum + p.ratingCount, 0)
    const avgRating = totalRatings > 0 ? ratingsSum / totalRatings : null

    // Get status distribution
    const statusStats = await db.protocol.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })

    // Get type distribution
    const typeStats = await db.protocol.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        type: true
      }
    })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await db.protocol.count({
      where: {
        ...whereClause,
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Get top performing protocols
    const topProtocols = await db.protocol.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        views: true,
        downloads: true,
        rating: true
      },
      orderBy: [
        { views: 'desc' },
        { downloads: 'desc' }
      ],
      take: 5
    })

    const stats = {
      totalProtocols,
      publishedProtocols,
      draftProtocols,
      totalViews,
      totalDownloads,
      avgRating,
      recentActivity,
      statusDistribution: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>),
      typeDistribution: typeStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.type
        return acc
      }, {} as Record<string, number>),
      topProtocols
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("[PROTOCOLS_STATS]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}