import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET(
  req: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;

  try {
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ enrolled: false });
    }

    return NextResponse.json({
      enrolled: true,
      purchaseId: purchase.id,
      enrolledAt: purchase.createdAt,
    });
  } catch (error) {
    console.error("[IS_ENROLLED_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
