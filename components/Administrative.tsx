"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Book, Brain, LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import { getUserData } from "@/app/(auth)/auth/userCurrent";

export const Administrative = () => {
  const router = useRouter();
  const { userId, signOut } = useAuth();
  const pathname = usePathname() || "";

  const [isTeacherUser, setIsTeacherUser] = useState(false);

  // Validación del rol del usuario
  useEffect(() => {
    const checkRole = async () => {
      if (userId) {
        const userData = await getUserData();
        const role = userData?.user.identities[0].identity_data.custom_role;
        if (!role) return;
        const hasAccess = ["teacher", "admin", "developer"].includes(role);
        setIsTeacherUser(hasAccess);
      }
    };
    checkRole();
  }, [userId]);

  const isTeacherPage = pathname.startsWith("/teacher");
  const isProfilePage = pathname.includes("/profile");
  const isStudentsPage = pathname === "/students";

  const handleChange = (value: string) => {
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
        signOut();
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
