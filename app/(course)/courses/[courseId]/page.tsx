// app / course / courses / [courseId] / page.tsx;
"use client";
import CourseRedirector from "./CourseRedirector";
import { useParams } from "next/navigation";

const Page: React.FC = () => {
  const params = useParams() as { courseId: string };

  return (
    <div>
      <CourseRedirector />
    </div>
  );
};

export default Page;
