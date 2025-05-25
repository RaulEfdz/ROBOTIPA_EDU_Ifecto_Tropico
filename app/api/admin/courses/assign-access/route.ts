import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing userId or courseId" },
        { status: 400 }
      );
    }

    // Check if the purchase already exists
    const existingPurchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "User already has access to this course" },
        { status: 409 }
      );
    }

    // Create the purchase record
    const purchase = await db.purchase.create({
      data: {
        userId,
        courseId,
      },
    });

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error("Error assigning course access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
