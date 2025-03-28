import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface Chapter {
  id: string;
  isPublished: boolean;
  position: number;
}

interface Course {
  id: string;
  chapters: Chapter[];
}

const CourseIdPage = async ({ params }: any) => {
  const course = await db.course.findUnique({
    where: {
      delete: false,
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  }) as Course | null;

  if (!course) {
     return redirect("/app/(auth)");;
  }

  if (!course.chapters.length) {
     return redirect("/app/(auth)");; // Or redirect to a "no chapters" page
  }

  return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
};

export default CourseIdPage;