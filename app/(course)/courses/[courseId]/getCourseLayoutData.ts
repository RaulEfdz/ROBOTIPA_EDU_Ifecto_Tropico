// app/courses/getCourseLayoutData.ts
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function getCourseLayoutData(courseId: string) {
  const user = await getCurrentUserFromDBServer();
  if (!user?.id) {
    redirect("/auth");
  }

  const course = await db.course.findUnique({
    where: { delete: false, id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: { userProgress: { where: { userId: user.id } } },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const progressCount = await getProgress(user.id, course.id);

  return { course, progressCount };
}
