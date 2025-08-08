"use client";

import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import {
  getAdminId,
  getStudentId,
  getTeacherId,
  getVisitorId,
} from "@/utils/roles/translate";
import { GraduationCap, Users, Shield, Eye } from "lucide-react";

export const Logo = () => {
  const { theme } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndCheckRole = async () => {
      const currentUser = await getCurrentUserFromDB();
      setUser(currentUser);
      setUserRole(currentUser?.customRole || null);
    };

    fetchUserAndCheckRole();
  }, []);

  const getRoleInfo = () => {
    if (!userRole)
      return {
        label: "Usuario",
        icon: Users,
        color: "bg-gray-500/20 text-gray-300",
      };

    if (userRole === getTeacherId()) {
      return {
        label: "Profesor",
        icon: GraduationCap,
        color: "bg-primary/20 text-primary",
      };
    }
    if (userRole === getAdminId()) {
      return {
        label: "Admin",
        icon: Shield,
        color: "bg-orange-500/20 text-orange-200",
      };
    }
    if (userRole === getStudentId()) {
      return {
        label: "Estudiante",
        icon: Users,
        color: "bg-blue-500/20 text-blue-200",
      };
    }
    if (userRole === getVisitorId()) {
      return {
        label: "Visitante",
        icon: Eye,
        color: "bg-purple-500/20 text-purple-200",
      };
    }

    return {
      label: "Usuario",
      icon: Users,
      color: "bg-gray-500/20 text-gray-300",
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <Link href="/" className="flex flex-col items-start gap-2 group w-full">
      {/* Logo */}
      <div className="relative mb-1">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
          <Image
            className="cursor-pointer transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
            height={80}
            width={80}
            alt="ROBOTIPA Logo"
            src={process.env.NEXT_PUBLIC_LOGO_LIGHT || "/LOGO_LIGHT.png"}
          />
        </div>
      </div>

      {/* Título y Badge de Rol */}
      <div className="flex flex-col items-start gap-1 w-full">
        <h1 className="font-bold text-lg leading-tight text-white tracking-wide">
          ROBOTIPA Academy
        </h1>
        <Badge
          className={`${roleInfo.color} border-0 text-xs font-medium flex items-center gap-1 px-2 py-0.5`}
        >
          <roleInfo.icon size={10} className="flex-shrink-0 text-white" />
          <span className="text-white">{roleInfo.label}</span>
        </Badge>
      </div>
    </Link>
  );
};

export default Logo;
