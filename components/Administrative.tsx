"use client";

import { usePathname, useRouter } from "next/navigation";
import { Book, Brain, LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import {
  getTeacherId,
  getAdminId,
} from "@/utils/roles/translate";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { createClient } from "@/utils/supabase/client";

export const Administrative = () => {
  const router = useRouter();
  const pathname = usePathname() || "";
  const supabase = createClient();

  const [isTeacherUser, setIsTeacherUser] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const user = await getCurrentUserFromDB();
      const role = user?.customRole;

      console.log("role:", role);

      if (!role) return;

      const allowedRoles = [getTeacherId(), getAdminId()];
      console.log("allowedRoles:", allowedRoles);
      const hasAccess = allowedRoles.includes(role);
      console.log("hasAccess:", hasAccess);
      setIsTeacherUser(hasAccess);
    };

    checkRole();
  }, []);

  const isTeacherPage = pathname.startsWith("/teacher");
  const isProfilePage = pathname.includes("/profile");
  const isStudentsPage = pathname === "/students";

  const handleChange = async (value: string) => {
    switch (value) {
      case "areaTeachers":
        router.push("/teacher");
        break;
      case "areaStudents":
        router.push("/students");
        break;
      case "areaProfile":
        router.push("/profile");
        break;
      case "logout":
        await supabase.auth.signOut();
        router.push("/auth");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full text-black">
      <Select onValueChange={handleChange}>
        <SelectTrigger className="text-black bg-opacity-75 bg-[#FFFCF8] border-none rounded-none w-full focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <div className="flex items-center gap-2">
            <Settings />
            <span>Administrar</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {isTeacherUser && !isTeacherPage && (
            <SelectItem value="areaTeachers" className="hover:bg-slate-100 pointer">
              <div className="text-black flex items-center w-full">
                <Book className="h-full w-1/6 text-gray-600 mx-2" />
                <span className="w-5/6">Profesores</span>
              </div>
            </SelectItem>
          )}
          {!isStudentsPage && (
            <SelectItem value="areaStudents" className="hover:bg-slate-100 pointer">
              <div className="text-black flex items-center w-full">
                <Brain className="h-full w-1/6 text-gray-600 mx-2" />
                <span className="w-5/6">Estudiante</span>
              </div>
            </SelectItem>
          )}
          {!isProfilePage && (
            <SelectItem value="areaProfile" className="hover:bg-slate-100 pointer">
              <div className="text-black flex items-center w-full">
                <User className="h-full w-1/6 text-gray-600 mx-2" />
                <span className="w-5/6">Mis Datos</span>
              </div>
            </SelectItem>
          )}
          <SelectItem value="logout" className="hover:bg-slate-100 pointer">
            <div className="text-black flex items-center w-full">
              <LogOut className="h-full w-1/6 text-gray-600 mx-2" />
              <span className="w-5/6">Cerrar sesión</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Administrative;
