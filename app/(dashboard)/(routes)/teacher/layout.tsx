"use client"
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { redirect } from "next/navigation";

const TeacherLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {

  if (!isTeacher()) {
     return redirect("/app/(auth)");;
  }

  return <div className="h-full  overflow-y-auto overflow-x-hidden">{children}</div>
}
 
export default TeacherLayout;