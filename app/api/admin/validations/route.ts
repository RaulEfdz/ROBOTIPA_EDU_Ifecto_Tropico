import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { isTeacher_server } from "@/app/(dashboard)/(routes)/admin/teacher_server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDBServer();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verificar que el usuario sea admin/teacher
    const isAuthorized = await isTeacher_server(user.id);
    if (!isAuthorized) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          {
            fullName: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            email: {
              contains: search,
              mode: "insensitive"
            }
          }
        ]
      };
    }

    // Obtener validaciones con paginación
    const [validations, total] = await Promise.all([
      db.documentValidation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              username: true,
              createdAt: true,
            }
          },
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        },
        orderBy: [
          { status: "asc" }, // PENDING primero
          { uploadedAt: "desc" }, // Más recientes primero
          { createdAt: "desc" }
        ],
        skip,
        take: limit,
      }),
      db.documentValidation.count({ where })
    ]);

    // Obtener estadísticas
    const stats = await db.documentValidation.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const formattedStats = stats.reduce((acc: any, stat: any) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      validations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        NO_SUBMITTED: formattedStats.NO_SUBMITTED || 0,
        PENDING: formattedStats.PENDING || 0,
        APPROVED: formattedStats.APPROVED || 0,
        REJECTED: formattedStats.REJECTED || 0,
        total
      }
    });

  } catch (error) {
    console.error("[ADMIN_VALIDATIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}