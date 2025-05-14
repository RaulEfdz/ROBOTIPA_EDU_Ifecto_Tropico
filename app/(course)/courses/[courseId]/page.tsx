// app / course / courses / [courseId] / page.tsx;
import ManualRegistrationButton from "@/app/pages/course/[courseId]/components/ManualRegistrationButton";
import CourseRedirector from "./CourseRedirector";

export default function Page({ params }: { params: { courseId: string } }) {
  const courseId = params.courseId;
  const courseTitle = "Título del Curso"; // Reemplazar con lógica para obtener el título real del curso

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
}
