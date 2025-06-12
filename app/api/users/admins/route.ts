import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

// GET /api/admins - Devuelve todos los administradores con estadísticas del sistema
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de admin
    if (!ADMIN_ID || typeof ADMIN_ID !== "string") {
      console.error(
        "[API admins] Environment variable ADMIN_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Admin Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Administradores
    const admins = await db.user.findMany({
      where: { customRole: ADMIN_ID },
      orderBy: { fullName: "asc" },
    });

    // Obtener estadísticas del sistema para contexto
    const [totalUsers, totalCourses, totalPurchases, totalRevenue] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.purchase.count(),
      db.purchase.findMany({
        include: { course: { select: { price: true } } }
      }).then(purchases => 
        purchases.reduce((sum, p) => sum + (p.course.price || 0), 0)
      )
    ]);

    // Estadísticas por rol
    const usersByRole = await db.user.groupBy({
      by: ['customRole'],
      _count: true
    });

    // Procesar datos para cada admin
    const adminsWithStats = admins.map(admin => {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(admin.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const lastActiveToday = admin.lastSignInAt && 
        new Date(admin.lastSignInAt).toDateString() === new Date().toDateString();

      return {
        ...admin,
        adminStats: {
          daysSinceCreation,
          lastActiveToday,
          systemStats: {
            totalUsers,
            totalCourses,
            totalPurchases,
            totalRevenue,
            usersByRole: usersByRole.reduce((acc, curr) => {
              if (curr.customRole === TEACHER_ID) acc.teachers = curr._count;
              else if (curr.customRole === STUDENT_ID) acc.students = curr._count;
              else if (curr.customRole === ADMIN_ID) acc.admins = curr._count;
              else if (curr.customRole === VISITOR_ID) acc.visitors = curr._count;
              return acc;
            }, { teachers: 0, students: 0, admins: 0, visitors: 0 })
          }
        }
      };
    });

    return NextResponse.json({ success: true, admins: adminsWithStats });
  } catch (error) {
    console.error("[API admins GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching admins." },
      { status: 500 }
    );
  }
}
