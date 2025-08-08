import { Chapter, Course, UserProgress } from "@prisma/client"


import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { Logo } from "@/utils/logo";

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  purchase: any;
  user: any;
};

export const CourseNavbar = ({
  course,
  progressCount,
  purchase,
  user,
}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-[#FFFCF8] shadow-sm">
      <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
        purchase={purchase}
        user={user}
      />
      <Logo version="original"/>
      {/* <NavbarRoutes onToggleSidebar={function (): void {
        throw new Error("Function not implemented.");
      } } isSidebarOpen={false} />       */}
    </div>
  )
}