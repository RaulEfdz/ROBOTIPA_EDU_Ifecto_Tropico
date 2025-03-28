import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { TooltipProvider } from "@/components/ui/tooltip";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

const CoursesPage = async () => {
  const user = (await getUserDataServer())?.user;

  if (!user?.id) {
    return redirect("/app/(auth)");
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
