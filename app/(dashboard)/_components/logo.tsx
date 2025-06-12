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
        color: "bg-emerald-500/20 text-emerald-200",
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
      <div className="relative">
        <Image
          className="cursor-pointer transition-transform group-hover:scale-105"
          height={100}
          width={100}
          alt="ROBOTIPA Logo"
          src="/rbtpligth.png"
        />
      </div>

      {/* Título y Badge de Rol */}
      <div className="flex flex-col items-start gap-1 w-full">
        <h1 className="text-emerald-100 font-bold text-sm leading-tight">
          INFECTOTRÓPICO
        </h1>
        <Badge
          className={`${roleInfo.color} border-0 text-xs font-medium flex items-center gap-1 px-2 py-0.5`}
        >
          <roleInfo.icon size={10} className="flex-shrink-0" />
          <span>{roleInfo.label}</span>
        </Badge>
      </div>
    </Link>
  );
};

export default Logo;
