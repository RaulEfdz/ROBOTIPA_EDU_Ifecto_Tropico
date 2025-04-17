import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

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
        <DataTable columns={columns} data={courses} />
      </TooltipProvider>
  );
};

export default CoursesPage;
