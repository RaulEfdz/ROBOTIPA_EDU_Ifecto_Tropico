import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const purchases = await db.purchase.findMany({
      select: {
        userId: true,
        courseId: true,
      },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
