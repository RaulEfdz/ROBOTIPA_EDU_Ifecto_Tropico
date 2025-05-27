// app/(course)/courses/[courseId]/getCourseData.ts
import { db } from "@/lib/db";

export interface Chapter {
  id: string;
  isPublished: boolean;
  position: number;
}

export interface Course {
  id: string;
  userId: string;
  chapters: Chapter[];
}

export async function getCourseWithPublishedChapters(
  courseId: string
): Promise<Course | null> {
  const course = await db.course.findUnique({
    where: {
      delete: false,
      id: courseId,
    },
    select: {
      id: true,
      userId: true,
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          isPublished: true,
          position: true,
        },
      },
    },
  });

  return course as Course | null;
}
