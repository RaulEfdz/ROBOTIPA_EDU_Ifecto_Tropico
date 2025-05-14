import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingPurchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!existingPurchase) {
      return NextResponse.json({ message: "No estás inscrito en este curso." });
    }

    await db.purchase.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    return NextResponse.json({ message: "Desinscripción completada." });
  } catch (error) {
    console.error("[UNENROLL_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
