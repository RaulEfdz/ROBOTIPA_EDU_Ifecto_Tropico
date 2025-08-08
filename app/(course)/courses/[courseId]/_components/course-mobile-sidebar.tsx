import { Menu } from "lucide-react";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";
import { CourseLayoutWrapper } from "./course-layout-wrapper";

interface CourseMobileSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  purchase: any;
  user: any;
};

export const CourseMobileSidebar = ({ 
  course,
  progressCount,
  purchase,
  user,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-[#FFFCF8] w-72">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          purchase={purchase}
          user={user}
        />
      </SheetContent>
    </Sheet>
  )
}