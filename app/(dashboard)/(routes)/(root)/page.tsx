import { redirect } from "next/navigation";
import { Check,Clock } from "lucide-react";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { InfoCard } from "./_components/info-card";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user =  await currentUser();
  if (!user?.id) {
    return redirect("/profile");
  }

  const {
    completedCourses,
    coursesInProgress
  } = await getDashboardCourses(user?.id);

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
      <CoursesList
        items={[...coursesInProgress, ...completedCourses]}
      />
    </div>
  )
}
