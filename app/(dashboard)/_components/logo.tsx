"use client";

import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import {
  getAdminId,
  getStudentId,
  getTeacherId,
  getVisitorId,
} from "@/utils/roles/translate";
import { GraduationCap, Users, Shield, Eye } from "lucide-react";
import { getLogoUrlsSync } from "@/lib/dropbox";

interface UserData {
  customRole?: string;
}

interface RoleInfo {
  label: string;
  icon: typeof Users;
  color: string;
}

const ROLE_CONFIG: Record<string, RoleInfo> = {
  teacher: {
    label: "Profesor",
    icon: GraduationCap,
    color: "bg-primary/20 text-primary",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-orange-500/20 text-orange-200",
  },
  student: {
    label: "Estudiante",
    icon: Users,
    color: "bg-blue-500/20 text-blue-200",
  },
  visitor: {
    label: "Visitante",
    icon: Eye,
    color: "bg-purple-500/20 text-purple-200",
  },
};

const DEFAULT_ROLE: RoleInfo = {
  label: "Usuario",
  icon: Users,
  color: "bg-gray-500/20 text-gray-300",
};

export const Logo = () => {
  const { theme, resolvedTheme } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndCheckRole = async () => {
      try {
        const currentUser: UserData | null = await getCurrentUserFromDB();
        setUserRole(currentUser?.customRole || null);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCheckRole();
  }, []);

  const roleInfo = useMemo((): RoleInfo => {
    if (!userRole) return DEFAULT_ROLE;

    const teacherId = getTeacherId();
    const adminId = getAdminId();
    const studentId = getStudentId();
    const visitorId = getVisitorId();

    if (userRole === teacherId) return ROLE_CONFIG.teacher;
    if (userRole === adminId) return ROLE_CONFIG.admin;
    if (userRole === studentId) return ROLE_CONFIG.student;
    if (userRole === visitorId) return ROLE_CONFIG.visitor;

    return DEFAULT_ROLE;
  }, [userRole]);

  const logoSrc = useMemo(() => {
    const currentTheme = resolvedTheme || theme;
    const isDark = currentTheme === "dark";
    const logoUrls = getLogoUrlsSync();
    
    return isDark ? logoUrls.logoLight : logoUrls.logo;
  }, [theme, resolvedTheme]);

  const appName = process.env.NEXT_PUBLIC_NAME_APP || "ROBOTIPA Academy";

  return (
    <Link 
      href="/" 
      className="flex flex-col items-start gap-3 group w-full transition-all duration-200 hover:opacity-90"
      aria-label={`Ir a página principal de ${appName}`}
    >
      {/* Logo Container */}
      <div className="relative">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/15">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              className="cursor-pointer transition-all duration-300 group-hover:scale-105 drop-shadow-lg"
              height={80}
              width={80}
              alt={`${appName} Logo`}
              src={logoSrc}
              priority
              sizes="80px"
              style={{
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>

      {/* App Title and Role Badge */}
      <div className="flex flex-col items-start gap-2 w-full">
        <h1 className="font-bold text-lg leading-tight text-white tracking-wide transition-all duration-200 group-hover:text-white/90">
          {appName}
        </h1>
        
        {!isLoading && (
          <Badge
            className={`${roleInfo.color} border-0 text-xs font-medium flex items-center gap-1.5 px-3 py-1 transition-all duration-200 hover:scale-105`}
            variant="secondary"
          >
            <roleInfo.icon 
              size={12} 
              className="flex-shrink-0 text-white" 
              aria-hidden="true"
            />
            <span className="text-white font-medium">
              {roleInfo.label}
            </span>
          </Badge>
        )}
        
        {isLoading && (
          <div className="h-6 w-20 bg-gray-500/20 rounded animate-pulse" />
        )}
      </div>
    </Link>
  );
};

export default Logo;