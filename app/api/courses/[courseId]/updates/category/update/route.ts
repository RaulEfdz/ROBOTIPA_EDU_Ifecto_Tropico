import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

export async function POST(
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

    const { categoryId, newCategoryName } = await req.json();

    if (
      (!categoryId || categoryId.trim() === "") &&
      (!newCategoryName || newCategoryName.trim() === "")
    ) {
      return new NextResponse(
        "Bad Request: categoryId or newCategoryName is required",
        {
          status: 400,
        }
      );
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        // userId: user.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    // Permitir solo si es admin (por ID) o dueño del curso
    const isAdmin = user && translateRole(user.role) === "admin";
    const isOwner = user && course.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let finalCategoryId = categoryId?.trim();

    // Si viene un nombre nuevo, creamos o buscamos la categoría
    if (!finalCategoryId && newCategoryName) {
      const normalizedName = newCategoryName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      let existingCategory = await db.category.findFirst({
        where: {
          name: {
            equals: normalizedName,
            mode: "insensitive",
          },
        },
      });

      if (!existingCategory) {
        existingCategory = await db.category.create({
          data: {
            name: normalizedName,
          },
        });
      }

      finalCategoryId = existingCategory.id;
    }

    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        categoryId: finalCategoryId,
      },
      select: {
        id: true,
        categoryId: true,
        updatedAt: true,
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("[COURSE_UPDATE_CATEGORY]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
