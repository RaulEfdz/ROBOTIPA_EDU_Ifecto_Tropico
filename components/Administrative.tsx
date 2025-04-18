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
      const allowedRoles = [getTeacherId(), getAdminId()];
      setIsTeacherUser(role ? allowedRoles.includes(role) : false);
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
    <div className="w-full text-white">
      <Select onValueChange={handleChange}>
        <SelectTrigger className="bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 w-full px-4 py-2 rounded-md text-sm font-medium">
          <div className="flex items-center gap-2">
            <Settings size={18} />
            <span>Administrar</span>
          </div>
        </SelectTrigger>

        <SelectContent className="bg-white text-black rounded-md shadow-md">
          {isTeacherUser && !isTeacherPage && (
            <SelectItem value="areaTeachers">
              <div className="flex items-center gap-3">
                <Book size={18} className="text-gray-700" />
                <span>Profesores</span>
              </div>
            </SelectItem>
          )}
          {!isStudentsPage && (
            <SelectItem value="areaStudents">
              <div className="flex items-center gap-3">
                <Brain size={18} className="text-gray-700" />
                <span>Estudiantes</span>
              </div>
            </SelectItem>
          )}
          {!isProfilePage && (
            <SelectItem value="areaProfile">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-700" />
                <span>Mis Datos</span>
              </div>
            </SelectItem>
          )}
          <SelectItem value="logout">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-gray-700" />
              <span>Cerrar sesión</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Administrative;
