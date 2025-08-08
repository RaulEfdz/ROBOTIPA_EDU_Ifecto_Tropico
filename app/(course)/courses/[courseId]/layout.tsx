// app/courses/[courseId]/layout.tsx
import { CourseSidebar } from "./_components/course-sidebar";
import { getCourseLayoutData } from "./getCourseLayoutData";
import WhatsAppStudentButton from "@/app/components/WhatsAppStudentButton";
import { CourseLayoutWrapper } from "./_components/course-layout-wrapper";

const CourseLayout = async ({ children, params }: any) => {
  // Desestructuramos los datos cargados
  const { course, progressCount, purchase, user } = await getCourseLayoutData(params.courseId);

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
