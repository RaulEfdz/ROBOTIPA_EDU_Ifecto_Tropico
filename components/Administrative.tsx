"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Book, Brain, LogOut, Outdent, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";

export const Administrative = () => {
  const route = useRouter();
  const { userId, signOut} = useAuth();
  const pathname = usePathname() || "";

  const [isTeacherUser, setIsTeacherUser] = useState(false);

  // Validación del rol del usuario
  useEffect(() => {
    const checkRole = async () => {
      if (userId) {
        const result = await isTeacher(userId);
        setIsTeacherUser(result);
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
        route.push("/teacher");
        break;
      case "areaStudents":
        route.push("/students");
        break;
      case "areaProfile":
        route.push("/profile");
        break;
      case "logout":
        signOut()
        break
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
                <Book className="h-full w-1/6 text-gray-600 mx-2"  />
                <span className=" w-5/6">Profesores</span>
              </div>
            </SelectItem>
          )}
          {!isStudentsPage && (
            <SelectItem value="areaStudents" className="hover:bg-slate-100 pointer">
              <div className="text-black flex items-center w-full">
                <Brain className="h-full w-1/6 text-gray-600 mx-2" />
                <span className=" w-5/6">Estudiante</span>
              </div>
            </SelectItem>
          )}
          {!isProfilePage && (
            <SelectItem value="areaProfile" className="hover:bg-slate-100 pointer">
              <div className="text-black flex items-center w-full">
                <User className="h-full w-1/6 text-gray-600 mx-2"  />
                <span className=" w-5/6">Mis Datos</span>
              </div>
            </SelectItem>
          )}
          <SelectItem value="logout" className="hover:bg-slate-100 pointer">
              <div className="text-black flex items-center w-full">
                <LogOut className="h-full w-1/6 text-gray-600 mx-2"  />
                <span className=" w-5/6">Cerrar sesion</span>
              </div>
            </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Administrative;
