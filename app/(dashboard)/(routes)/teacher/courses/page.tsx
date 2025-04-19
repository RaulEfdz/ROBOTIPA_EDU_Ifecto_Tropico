import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { TeacherTable } from "./_components/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { courseColumns } from "./_components/columns";

const CoursesPage = async () => {
  const user = await getCurrentUserFromDBServer(); // ✅ Correcto

  if (!user?.id) {
    return redirect("/");
  }

  const courses = await db.course.findMany({
     where: {
      //  userId,
       delete: false,
     },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
      <TooltipProvider>
        <TeacherTable columns={courseColumns} data={courses} />
        </TooltipProvider>
  );
};

export default CoursesPage;
