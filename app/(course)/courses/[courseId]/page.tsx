// app / course / courses / [courseId] / page.tsx;
"use client";
import ManualRegistrationButton from "@/app/pages/course/[courseId]/components/ManualRegistrationButton";
import CourseRedirector from "./CourseRedirector";
import { useParams } from "next/navigation";

const Page: React.FC = () => {
  const params = useParams() as { courseId: string };
  const courseId = params.courseId;

  const courseTitle: string = "Título del Curso"; // Reemplazar con lógica para obtener el título real del curso

  return (
    <div>
      <CourseRedirector />
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
        <ManualRegistrationButton
          courseId={courseId}
          courseTitle={courseTitle}
        />
      </div>
    </div>
  );
};

export default Page;
