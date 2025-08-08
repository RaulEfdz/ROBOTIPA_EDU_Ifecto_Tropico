"use client";

import { useState, createContext, useContext } from "react";
import { CourseSidebar } from "./course-sidebar";
import { Chapter, Course, UserProgress } from "@prisma/client";

interface CourseLayoutWrapperProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  purchase: any;
  user: any;
  children: React.ReactNode;
}

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a CourseLayoutWrapper");
  }
  return context;
};

export const CourseLayoutWrapper = ({
  course,
  progressCount,
  purchase,
  user,
  children,
}: CourseLayoutWrapperProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="h-full">
        <div className={`hidden md:flex h-full flex-col fixed inset-y-0 z-50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-80'
        }`}>
          <CourseSidebar 
            course={course} 
            progressCount={progressCount}
            purchase={purchase}
            user={user}
          />
        </div>
        <main className={`h-full transition-all duration-300 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-80'
        }`}>
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};