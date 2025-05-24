import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;

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

    // Permitir solo si es admin (por ID) o dueño del curso
    const isAdmin = user && translateRole(user.role) === "admin";
    const isOwner = user && purchase?.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!purchase) {
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
