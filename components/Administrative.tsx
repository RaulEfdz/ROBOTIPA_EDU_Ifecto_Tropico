"use client";

import { usePathname, useRouter } from "next/navigation";
import { Book, Brain, LogOut, Settings, User, ChevronDown, Monitor, Palette } from "lucide-react";
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
      className="w-full text-white px-1 sm:px-0"
      role="navigation"
      aria-label="Menú administrativo"
    >
      <Select onValueChange={handleChange}>
        <SelectTrigger
          className="bg-gradient-to-r from-primary-800 to-primary-700 text-white hover:from-primary-700 hover:to-primary-600 border border-primary-600 shadow-lg transition-all duration-300 w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium group [&>svg]:hidden"
          aria-label="Abrir menú administrativo"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="p-0.5 sm:p-1 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                <Settings size={14} className="sm:size-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-medium truncate text-white">Administrar</span>
            </div>
            <ChevronDown size={12} className="sm:size-3.5 text-white/80 group-hover:text-white transition-colors flex-shrink-0" />
          </div>
        </SelectTrigger>

        <SelectContent className="bg-gradient-to-b from-primary-800 to-primary-700 border border-primary-600 rounded-lg shadow-2xl backdrop-blur-sm min-w-[200px] sm:min-w-[220px] max-w-[280px]">
          {isTeacherUser && !isTeacherPage && (
            <SelectItem 
              value="areaTeachers" 
              aria-label="Ir a Profesores"
              className="hover:bg-primary-600/40 focus:bg-primary-600/40 transition-colors duration-200 rounded-md mx-1 my-0.5 text-white text-left justify-start pl-2"
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div className="p-1 sm:p-1.5 rounded-md bg-primary-500/20">
                  <Book size={14} className="sm:size-4 text-primary-200" aria-hidden="true" />
                </div>
                <span className="text-white font-medium text-sm sm:text-base truncate">Área Profesores</span>
              </div>
            </SelectItem>
          )}
          {!isStudentsPage && (
            <SelectItem 
              value="areaStudents" 
              aria-label="Ir a Estudiantes"
              className="hover:bg-primary-600/40 focus:bg-primary-600/40 transition-colors duration-200 rounded-md mx-1 my-0.5 text-white text-left justify-start pl-2"
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div className="p-1 sm:p-1.5 rounded-md bg-blue-500/20">
                  <Brain size={14} className="sm:size-4 text-blue-200" aria-hidden="true" />
                </div>
                <span className="text-white font-medium text-sm sm:text-base truncate">Área Estudiantes</span>
              </div>
            </SelectItem>
          )}
          {!isProfilePage && (
            <SelectItem 
              value="areaProfile" 
              aria-label="Ir a Mis Datos"
              className="hover:bg-primary-600/40 focus:bg-primary-600/40 transition-colors duration-200 rounded-md mx-1 my-0.5 text-white text-left justify-start pl-2"
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div className="p-1 sm:p-1.5 rounded-md bg-purple-500/20">
                  <User size={14} className="sm:size-4 text-purple-200" aria-hidden="true" />
                </div>
                <span className="text-white font-medium text-sm sm:text-base truncate">Mi Perfil</span>
              </div>
            </SelectItem>
          )}
          <div className="border-t border-primary-500/30 my-1"></div>
          <SelectItem 
            value="logout" 
            aria-label="Cerrar sesión"
            className="hover:bg-red-600/40 focus:bg-red-600/40 transition-colors duration-200 rounded-md mx-1 my-0.5 text-white text-left justify-start pl-2"
          >
            <div className="flex items-center gap-2 sm:gap-3 py-1">
              <div className="p-1 sm:p-1.5 rounded-md bg-red-500/20">
                <LogOut size={14} className="sm:size-4 text-red-200" aria-hidden="true" />
              </div>
              <span className="text-white font-medium text-sm sm:text-base truncate">Cerrar Sesión</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Administrative;
