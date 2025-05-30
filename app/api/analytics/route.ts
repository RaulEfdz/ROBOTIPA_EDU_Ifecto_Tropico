// app/api/analytics/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

    return NextResponse.json({
      status: "success",
      data: {
        users: {
          total: totalUsers,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          unpublished: unpublishedCourses,
        },
        chapters: {
          total: totalChapters,
          free: freeChapters,
          premium: paidChapters,
        },
        purchases: {
          total: totalPurchases,
        },
        revenue: {
          totalPaidInvoices: totalRevenue,
          invoicesIssued: totalInvoices,
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
