import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const VISITOR_ID = process.env.VISITOR_ID;
const STUDENT_ID = process.env.STUDENT_ID;

// GET /api/visitors - Devuelve todos los visitantes con métricas de conversión
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de visitante
    if (!VISITOR_ID || typeof VISITOR_ID !== "string") {
      console.error(
        "[API visitors] Environment variable VISITOR_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Visitor Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Visitantes con información adicional
    const visitors = await db.user.findMany({
      where: { customRole: VISITOR_ID },
      orderBy: { createdAt: "desc" },
      include: {
        purchases: {
          include: {
            course: {
              select: { title: true, price: true }
            }
          }
        }
      }
    });

    // Obtener estadísticas de conversión
    const totalStudents = await db.user.count({
      where: { customRole: STUDENT_ID }
    });

    // Procesar datos para cada visitante
    const visitorsWithStats = visitors.map(visitor => {
      const daysSinceRegistration = Math.floor(
        (new Date().getTime() - new Date(visitor.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const hasInteracted = visitor.lastSignInAt !== null;
      const hasPurchased = visitor.purchases.length > 0;
      const convertedToStudent = false; // Los que compraron ya no deberían ser visitantes
      
      // Calcular engagement score basado en actividad
      let engagementScore = 0;
      if (hasInteracted) engagementScore += 30;
      if (visitor.lastSignInAt && daysSinceRegistration > 0) {
        const loginFrequency = new Date(visitor.lastSignInAt).getTime() - new Date(visitor.createdAt).getTime();
        if (loginFrequency < 7 * 24 * 60 * 60 * 1000) engagementScore += 20; // Logged in within 7 days
      }
      if (hasPurchased) engagementScore += 50;

      return {
        ...visitor,
        visitorStats: {
          daysSinceRegistration,
          hasInteracted,
          hasPurchased,
          engagementScore,
          potentialValue: hasPurchased ? 'Alto' : hasInteracted ? 'Medio' : 'Bajo',
          coursesViewed: visitor.purchases.map(p => ({
            title: p.course.title,
            price: p.course.price
          }))
        }
      };
    });

    // Estadísticas globales de visitantes
    const globalStats = {
      totalVisitors: visitors.length,
      activeVisitors: visitors.filter(v => v.lastSignInAt !== null).length,
      conversionRate: totalStudents > 0 && visitors.length > 0 
        ? ((totalStudents / (totalStudents + visitors.length)) * 100).toFixed(2)
        : 0,
      visitorsWithPurchases: visitors.filter(v => v.purchases.length > 0).length
    };

    return NextResponse.json({ 
      success: true, 
      visitor: visitorsWithStats,
      globalStats 
    });
  } catch (error) {
    console.error("[API visitors GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching visitors." },
      { status: 500 }
    );
  }
}
