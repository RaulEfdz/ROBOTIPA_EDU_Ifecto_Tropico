// app/api/analytics/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Función para calcular el porcentaje de cambio
function calcChange(current: number, prev: number) {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / prev) * 100;
}

export async function GET() {
  try {
    const [
      totalUsers,
      totalCourses,
      publishedCourses,
      unpublishedCourses,
      totalChapters,
      freeChapters,
      paidChapters,
      totalPurchases,
      // Reemplazar la línea de totalRevenue en el array de Promise.all por null y usar el valor calculado arriba
      totalInvoices,
      totalExams,
      publishedExams,
      totalExamAttempts,
    ] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.course.count({ where: { isPublished: false } }),
      db.chapter.count(),
      db.chapter.count({ where: { isFree: true } }),
      db.chapter.count({ where: { isFree: false } }),
      db.purchase.count(),
      null, // totalRevenue ahora se calcula abajo
      db.invoice.count(),
      db.exam.count(),
      db.exam.count({ where: { isPublished: true } }),
      db.examAttempt.count(),
    ]);

    // Calcular ingresos: suma de (precio del curso * número de compras por curso)
    const courses = await db.course.findMany({
      select: {
        id: true,
        price: true,
        purchases: true,
      },
    });
    const totalRevenue = courses.reduce((acc, course) => {
      const price = course.price || 0;
      const subscribers = course.purchases.length;
      return acc + price * subscribers;
    }, 0);

    // Calcular fecha de inicio y fin del mes anterior
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    // Usuarios mes anterior
    const usersLastMonth = await db.user.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });
    // Cursos publicados mes anterior
    const publishedCoursesLastMonth = await db.course.count({
      where: {
        isPublished: true,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });
    // Compras mes anterior
    const purchasesLastMonth = await db.purchase.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });
    // Ingresos mes anterior
    const coursesLastMonth = await db.course.findMany({
      select: {
        id: true,
        price: true,
        purchases: {
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        },
      },
    });
    const revenueLastMonth = coursesLastMonth.reduce((acc, course) => {
      const price = course.price || 0;
      const subscribers = course.purchases.length;
      return acc + price * subscribers;
    }, 0);

    const usersChange = calcChange(totalUsers, usersLastMonth);
    const coursesChange = calcChange(
      publishedCourses,
      publishedCoursesLastMonth
    );
    const purchasesChange = calcChange(totalPurchases, purchasesLastMonth);
    const revenueChange = calcChange(totalRevenue, revenueLastMonth);

    return NextResponse.json({
      status: "success",
      data: {
        users: {
          total: totalUsers,
          change: usersChange,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          unpublished: unpublishedCourses,
          change: coursesChange,
        },
        chapters: {
          total: totalChapters,
          free: freeChapters,
          premium: paidChapters,
        },
        purchases: {
          total: totalPurchases,
          change: purchasesChange,
        },
        revenue: {
          totalPaidInvoices: totalRevenue,
          invoicesIssued: totalInvoices,
          change: revenueChange,
        },
        exams: {
          total: totalExams,
          published: publishedExams,
          totalAttempts: totalExamAttempts,
        },
      },
    });
  } catch (error) {
    console.error("[ANALYTICS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
