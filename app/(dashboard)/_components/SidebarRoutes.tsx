"use client";

import {
  BarChart,
  Book,
  Brain,
  Compass,
  Folder,
  Layout,
  List,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Type definitions
interface Badge {
  color?: string;
  viewLabel?: boolean;
  until?: Date;
  textLabel?: string;
}

interface Route {
  icon: React.ComponentType;
  label: string;
  href: string;
  badge?: Badge;
  superAdmin?: boolean;
}

// Routes for guests
export const guestRoutes: Route[] = [
  {
    icon: Layout,
    label: "Tablero",
    href: "/",
  },
  {
    icon: Compass,
    label: "Explorar",
    href: "/search",
  },
];

// Routes for teachers
export const teacherRoutes: Route[] = [
  {
    icon: List,
    label: "Cursos",
    href: "/teacher/courses",
  },
  {
    icon: Users,
    label: "Usuarios", // Fixed typo in "Estudientes"
    href: "/teacher/accounts",
    badge: {
      viewLabel: false,
      until: new Date("2025-10-01"),
      textLabel: "Actualizado",
      color: "text-slate-700", // Changed to a more appropriate color
    },
  },
  {
    icon: Folder,
    label: "Recursos",
    href: "/teacher/attachments",
    badge: {
      viewLabel: false,
      until: new Date("2025-10-01"),
      textLabel: "Nuevo",
      color: "text-slate-700",
    },
  },
  {
    icon: Brain,
    label: "Quizes", // Added proper accent mark
    href: "/teacher/quizzes",
    badge: {
      viewLabel: false,
      until: new Date("2025-10-01"),
      textLabel: "Nuevo",
      color: "text-slate-700",
    },
  },
  {
    icon: Book,
    label: "Profesores", // Added proper accent mark
    href: "/teacher/TeacherCreators",
    badge: {
      viewLabel: false,
      until: new Date("2025-10-01"),
      textLabel: "Nuevo",
      color: "text-slate-700",
    },
    superAdmin: true,
  },
  {
    icon: BarChart,
    label: "Analitica",
    href: "/teacher/analytics",
    badge: {
      viewLabel: false,
      until: new Date("2025-10-01"),
      textLabel: "Actualizado",
      color: "text-slate-700",
    },
    superAdmin: true,
  },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.startsWith("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const isNewFeatureVisible = (until?: Date): boolean => {
    if (!until) return false;
    return new Date() <= until;
  };
  

  return (
    <div className="flex flex-col w-full bg-transparent">
      <Label className=" text-gray-100 w-full pl-5 mb-3 bg-opacity-10 bg-black py-2">
        Herramientas
      </Label>
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={
            <div className="flex items-center">
              {route.label}
              {route.badge?.viewLabel &&
                isNewFeatureVisible(route.badge.until) && (
                  <span
                    className={cn(
                      "ml-2 text-xs font-light rounded-full bg-[#FFFCF8]/90 px-2 py-0.5",
                      route.badge.color
                    )}
                  >
                    {route.badge.textLabel}
                  </span>
                )}
            </div>
          }
          href={route.href}
        />
      ))}

    
    </div>
  );
};
