// app/(course)/courses/[courseId]/getCourseData.ts
import { db } from "@/lib/db";

export interface Chapter {
  id: string;
  isPublished: boolean;
  position: number;
}

export interface Course {
  id: string;
  chapters: Chapter[];
}

export async function getCourseWithPublishedChapters(courseId: string): Promise<Course | null> {
  const course = await db.course.findUnique({
    where: {
      delete: false,
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return course as Course | null;
}
