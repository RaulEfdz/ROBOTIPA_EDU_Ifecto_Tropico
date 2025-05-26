import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get current date and date 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Helper function to format date as YYYY-MM
    const formatYearMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    };

    // Generate array of last 6 months in YYYY-MM format
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.unshift(formatYearMonth(date));
    }

    // Query new users grouped by month
    const usersByMonthRaw = await db.user.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
    });

    // Query new courses grouped by month
    const coursesByMonthRaw = await db.course.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
    });

    // Query total revenue grouped by month from paid invoices
    const revenueByMonthRaw = await db.invoice.groupBy({
      by: ["issuedAt"],
      _sum: {
        amount: true,
      },
      where: {
        status: "paid",
        issuedAt: {
          gte: sixMonthsAgo,
        },
      },
    });

    // Helper to convert raw groupBy results to map of YYYY-MM to count/sum
    const toMonthMap = (
      raw: any[],
      dateField: string,
      countField: string | null,
      sumField: string | null
    ) => {
      const map: Record<string, number> = {};
      raw.forEach((item) => {
        const date = new Date(item[dateField]);
        const ym = formatYearMonth(date);
        if (countField) {
          map[ym] = item[`_count`][countField] || 0;
        } else if (sumField) {
          map[ym] = item[`_sum`][sumField] || 0;
        }
      });
      return map;
    };

    const usersByMonth = toMonthMap(usersByMonthRaw, "createdAt", "id", null);
    const coursesByMonth = toMonthMap(
      coursesByMonthRaw,
      "createdAt",
      "id",
      null
    );
    const revenueByMonth = toMonthMap(
      revenueByMonthRaw,
      "issuedAt",
      null,
      "amount"
    );

    // Build final trend data array for last 6 months
    const trendData = months.map((month) => ({
      month,
      users: usersByMonth[month] || 0,
      courses: coursesByMonth[month] || 0,
      revenue: revenueByMonth[month] || 0,
    }));

    return NextResponse.json({
      status: "success",
      data: trendData,
    });
  } catch (error) {
    console.error("[ANALYTICS_TRENDS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
