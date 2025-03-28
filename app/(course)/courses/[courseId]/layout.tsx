import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { currentUser } from "@clerk/nextjs/server";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params:any
}) => {
  const user = await currentUser();
 
   if (!user?.id) {
     return redirect("/app/(auth)");
  }

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
        include: {
          userProgress: {
            where: {
              userId: user?.id,
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      },
    },
  });

  if (!course) {
     return redirect("/app/(auth)");;
  }

  const progressCount = await getProgress(user?.id, course.id);

  return (
    <div className="h-full">
      
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          progressCount={progressCount}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout