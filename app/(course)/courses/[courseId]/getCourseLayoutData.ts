// app/courses/getCourseLayoutData.ts
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function getCourseLayoutData(courseId: string) {
  // 1. Obtener usuario y validar sesión
  const user = await getCurrentUserFromDBServer();
  if (!user?.id) {
    redirect("/");
  }

  // 2. Cargar curso con capítulos publicados y progreso del usuario
  const course = await db.course.findUnique({
    where: {
      delete: false,
      id: courseId,
    },
    include: {
      chapters: {
        where: { isPublished: true },
        include: {
          userProgress: {
            where: { userId: user.id },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    redirect("/");
  }

  // 3. Calcular progreso total
  const progressCount = await getProgress(user.id, course.id);

  return { course, progressCount };
}
