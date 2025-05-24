// app / course / courses / [courseId] / page.tsx;
"use client";
import CourseRedirector from "./CourseRedirector";
import { useParams } from "next/navigation";

const Page: React.FC = () => {
  const params = useParams() as { courseId: string };

  return (
    <div>
      <CourseRedirector />
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center"></div>
    </div>
  );
};

export default Page;
