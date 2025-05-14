// app/courses/[courseId]/layout.tsx
import { ReactNode } from "react";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { getCourseLayoutData } from "./getCourseLayoutData";

const CourseLayout = async ({ children, params }: any) => {
  // Desestructuramos los datos cargados
  const { course, progressCount } = await getCourseLayoutData(params.courseId);

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="md:pl-80 h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
