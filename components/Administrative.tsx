"use client";

import { usePathname, useRouter } from "next/navigation";
import { Book, Brain, LogOut, Settings, User } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { getTeacherId, getAdminId } from "@/utils/roles/translate";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { createClient } from "@/utils/supabase/client";

export const Administrative = () => {
  const router = useRouter();
  const pathname = usePathname() || "";
  const supabase = createClient();

  const [isTeacherUser, setIsTeacherUser] = useState(false);

  // Verifica si el usuario es profesor o admin
  const checkRole = useCallback(async () => {
    const user = await getCurrentUserFromDB();
    const role = user?.customRole;
    const allowedRoles = [getTeacherId(), getAdminId()];
    setIsTeacherUser(role ? allowedRoles.includes(role) : false);
  }, []);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  const isTeacherPage = pathname.startsWith("/teacher");
  const isProfilePage = pathname.includes("/profile");
  const isStudentsPage = pathname === "/students";

  // Maneja el cambio de opción en el menú administrativo
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
    <div
      className="w-full text-white"
      role="navigation"
      aria-label="Menú administrativo"
    >
      <Select onValueChange={handleChange}>
        <SelectTrigger
          className="bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 w-full px-4 py-2 rounded-md text-sm font-medium"
          aria-label="Abrir menú administrativo"
        >
          <div className="flex items-center gap-2">
            <Settings size={18} aria-hidden="true" />
            <span>Administrar</span>
          </div>
        </SelectTrigger>

        <SelectContent className="bg-white text-black rounded-md shadow-md">
          {isTeacherUser && !isTeacherPage && (
            <SelectItem value="areaTeachers" aria-label="Ir a Profesores">
              <div className="flex items-center gap-3">
                <Book size={18} className="text-gray-700" aria-hidden="true" />
                <span>Profesores</span>
              </div>
            </SelectItem>
          )}
          {!isStudentsPage && (
            <SelectItem value="areaStudents" aria-label="Ir a Estudiantes">
              <div className="flex items-center gap-3">
                <Brain size={18} className="text-gray-700" aria-hidden="true" />
                <span>Estudiantes</span>
              </div>
            </SelectItem>
          )}
          {!isProfilePage && (
            <SelectItem value="areaProfile" aria-label="Ir a Mis Datos">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-700" aria-hidden="true" />
                <span>Mis Datos</span>
              </div>
            </SelectItem>
          )}
          <SelectItem value="logout" aria-label="Cerrar sesión">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-gray-700" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Administrative;
