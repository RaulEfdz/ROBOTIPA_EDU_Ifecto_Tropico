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
      totalRevenue,
      totalInvoices,
      totalExams,
      publishedExams,
      totalExamAttempts
    ] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.course.count({ where: { isPublished: false } }),
      db.chapter.count(),
      db.chapter.count({ where: { isFree: true } }),
      db.chapter.count({ where: { isFree: false } }),
      db.purchase.count(),
      db.invoice.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "paid",
        },
      }),
      db.invoice.count(),
      db.exam.count(),
      db.exam.count({ where: { isPublished: true } }),
      db.examAttempt.count(),
    ]);

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
          totalPaidInvoices: totalRevenue._sum.amount || 0,
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
