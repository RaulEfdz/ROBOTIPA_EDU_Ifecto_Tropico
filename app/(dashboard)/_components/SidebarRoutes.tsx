"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Badge {
  color?: string;
  viewLabel?: boolean;
  until?: Date;
  textLabel?: string;
}

interface Route {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: Badge;
  superAdmin?: boolean;
}

export const guestRoutes: Route[] = [
  { icon: Layout, label: "Tablero", href: "/" },
  { icon: Compass, label: "Explorar", href: "/search" },
];

export const teacherRoutes: Route[] = [
  { icon: List, label: "Cursos", href: "/teacher/courses" },
  {
    icon: Users,
    label: "Usuarios",
    href: "/teacher/accounts",
    badge: { viewLabel: true, until: new Date("2025-10-01"), textLabel: "Actualizado", color: "text-amber-400" },
  },
  {
    icon: Folder,
    label: "Recursos",
    href: "/teacher/attachments",
    badge: { viewLabel: true, until: new Date("2025-10-01"), textLabel: "Nuevo", color: "text-green-400" },
  },
  {
    icon: Brain,
    label: "Quizzes",
    href: "/teacher/quizzes",
    badge: { viewLabel: true, until: new Date("2025-10-01"), textLabel: "Nuevo", color: "text-blue-400" },
  },
  {
    icon: Book,
    label: "Profesores",
    href: "/teacher/TeacherCreators",
    badge: { viewLabel: true, until: new Date("2025-10-01"), textLabel: "Nuevo", color: "text-purple-400" },
    superAdmin: true,
  },
  {
    icon: BarChart,
    label: "Analítica",
    href: "/teacher/analytics",
    badge: { viewLabel: true, until: new Date("2025-10-01"), textLabel: "Actualizado", color: "text-rose-400" },
    superAdmin: true,
  },
];

export const SidebarRoutes = () => {
  const pathname = usePathname() || "/";
  const isTeacherPage = pathname.startsWith("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [showBadges, setShowBadges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBadges(false);
    }, 10000); // Oculta los badges después de 10 segundos

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      routes.forEach((route, index) => {
        setTimeout(() => setAnimatedItems(prev => [...prev, route.href]), index * 100);
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [routes]);

  const isNewFeatureVisible = (until?: Date) => until ? new Date() <= until : false;

  return (
    <div className="px-4 py-2">
      <Separator className="mb-4" />
      <Label className="uppercase text-white text-xs tracking-wide mb-3">Herramientas</Label>
      <nav className="space-y-2">
        {routes.map(route => {
          const isAnimated = animatedItems.includes(route.href);

          return (
            <SidebarItem
              key={route.href}
              href={route.href}
              icon={route.icon}
              isAnimated={isAnimated}
              label={
                <div className="flex items-center space-x-3 w-full">
                  <span className="flex-1 text-sm font-medium truncate hover:bg-opacity-80">{route.label}</span>
                  {showBadges && route.badge?.viewLabel && isNewFeatureVisible(route.badge.until) && (
                    <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 ${route.badge.color}`}>
                      {route.badge.textLabel}
                    </span>
                  )}
                </div>
              }
            />
          );
        })}
      </nav>
    </div>
  );
};
