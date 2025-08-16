import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = params;
    const { creditEnabled, creditsPerHour, totalCredits } = await req.json();

    // Verify the user owns this course
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Validate data
    if (creditEnabled && (!creditsPerHour && !totalCredits)) {
      return new NextResponse(
        "When credits are enabled, you must provide either creditsPerHour or totalCredits",
        { status: 400 }
      );
    }

    // Update the course
    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        creditEnabled: Boolean(creditEnabled),
        creditsPerHour: creditsPerHour ? parseFloat(creditsPerHour) : null,
        totalCredits: totalCredits ? parseFloat(totalCredits) : null,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[CREDITS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}