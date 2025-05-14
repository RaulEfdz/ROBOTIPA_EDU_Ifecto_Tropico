import { redirect } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import {
  CoursesList,
  CourseWithProgress,
  CourseWithProgressWithCategory,
} from "@/components/courses-list";
import { InfoCard } from "./_components/info-card";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export default async function Dashboard() {
  const user = await getCurrentUserFromDBServer();

  if (!user) {
    return redirect("/auth");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    user.id
  );

  // Combinamos ambos arrays y los casteamos al tipo aceptado por CoursesList
  const allCourses = [
    ...coursesInProgress,
    ...completedCourses,
  ] as unknown as Array<CourseWithProgress | CourseWithProgressWithCategory>;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="En Progreso"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          icon={Check}
          label="Completado"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>

      <CoursesList items={allCourses} />
    </div>
  );
}
