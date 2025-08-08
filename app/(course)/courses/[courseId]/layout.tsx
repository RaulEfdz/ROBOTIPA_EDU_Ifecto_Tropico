// app/courses/[courseId]/layout.tsx
import { CourseSidebar } from "./_components/course-sidebar";
import { getCourseLayoutData } from "./getCourseLayoutData";
import WhatsAppStudentButton from "@/app/components/WhatsAppStudentButton";
import { CourseLayoutWrapper } from "./_components/course-layout-wrapper";

const CourseLayout = async ({ children, params }: any) => {
  // Ensure params is awaited if it's a promise, though Next.js usually handles this.
  // The error message suggests explicit awaiting might be necessary here.
  const resolvedParams = await params;
  // Desestructuramos los datos cargados
  const { course, progressCount, purchase, user } = await getCourseLayoutData(resolvedParams.courseId);

  return (
    <CourseLayoutWrapper 
      course={course} 
      progressCount={progressCount}
      purchase={purchase}
      user={user}
    >
      {children}
      
      {/* WhatsApp Floating Button for Mobile */}
      <div className="md:hidden">
        <WhatsAppStudentButton
          courseTitle={course.title}
          userName={user?.fullName || user?.username}
          userEmail={user?.email}
          variant="floating"
        />
      </div>
    </CourseLayoutWrapper>
  );
};

export default CourseLayout;
