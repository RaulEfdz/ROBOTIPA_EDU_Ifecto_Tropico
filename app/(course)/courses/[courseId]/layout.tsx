// app/courses/[courseId]/layout.tsx
import { CourseSidebar } from "./_components/course-sidebar";
import { getCourseLayoutData } from "./getCourseLayoutData";
import WhatsAppStudentButton from "@/app/components/WhatsAppStudentButton";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

const CourseLayout = async ({ children, params }: any) => {
  // Desestructuramos los datos cargados
  const { course, progressCount } = await getCourseLayoutData(params.courseId);
  const user = await getCurrentUserFromDBServer();

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="md:pl-80 h-full">{children}</main>
      
      {/* WhatsApp Floating Button for Mobile */}
      <div className="md:hidden">
        <WhatsAppStudentButton
          courseTitle={course.title}
          userName={user?.fullName || user?.username}
          userEmail={user?.email}
          variant="floating"
        />
      </div>
    </div>
  );
};

export default CourseLayout;
