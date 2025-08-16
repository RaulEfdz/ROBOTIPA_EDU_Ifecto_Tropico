"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  FileCheck, 
  UserPlus, 
  Settings,
  Shield,
  BookOpen,
  Award,
  Puzzle
} from "lucide-react";
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { isActive as isModuleActive } from "@/config/modules";
import { translateRole } from "@/utils/roles/translate";
import { canAccessAdminModule } from "@/utils/roles/hierarchy";

interface AdminSidebarRoutesProps {
  isCollapsed?: boolean;
  user: UserDB | null;
}

interface AdminRoute {
  href?: string;
  icon: any;
  label: string;
  module: string; // Nombre del módulo en config/modules.ts
  isCollapsible?: boolean;
  subRoutes?: AdminSubRoute[];
  badge?: {
    viewLabel: boolean;
    textLabel: string;
    until?: Date;
  };
}

interface AdminSubRoute {
  href: string;
  icon: any;
  label: string;
  module: string;
}

// Mapeo de módulos administrativos a rutas
const ADMIN_ROUTES: AdminRoute[] = [
  {
    href: "/admin/management",
    icon: Shield,
    label: "Panel Principal",
    module: "dashboard"
  },
  {
    href: "/admin/user-management",
    icon: Users,
    label: "Gestión de Usuarios",
    module: "user_management"
  },
  {
    href: "/admin/teacher-payments",
    icon: GraduationCap,
    label: "Gestión de Profesores",
    module: "teacher_management"
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    label: "Analíticas",
    module: "analytics"
  },
  {
    href: "/admin/validations",
    icon: FileCheck,
    label: "Validaciones",
    module: "document_validation"
  },
  {
    href: "/admin/manual-registrations",
    icon: UserPlus,
    label: "Registros Manuales",
    module: "manual_registrations"
  },
  {
    href: "/admin/certificates",
    icon: Award,
    label: "Certificados",
    module: "certificates"
  },
  {
    href: "/admin/modules",
    icon: Puzzle,
    label: "Estado de Módulos",
    module: "dashboard", // Siempre visible para admins
    badge: {
      viewLabel: true,
      textLabel: "Info"
    }
  },
  {
    icon: Users,
    label: "Usuarios por Rol",
    module: "user_management",
    isCollapsible: true,
    subRoutes: [
      {
        href: "/admin/users/admins",
        icon: Shield,
        label: "Administradores",
        module: "user_management"
      },
      {
        href: "/admin/users/teachers",
        icon: GraduationCap,
        label: "Profesores",
        module: "user_management"
      },
      {
        href: "/admin/users/students",
        icon: BookOpen,
        label: "Estudiantes",
        module: "user_management"
      },
      {
        href: "/admin/users/visitor",
        icon: Users,
        label: "Visitantes",
        module: "user_management"
      }
    ]
  }
];

export const AdminSidebarRoutes = ({ isCollapsed = false, user }: AdminSidebarRoutesProps) => {
  const pathname = usePathname() || "/";
  
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<AdminRoute[]>([]);
  const [userRole, setUserRole] = useState<string>('visitor');

  // Determinar el rol del usuario
  useEffect(() => {
    if (user?.customRole) {
      try {
        const roleName = translateRole(user.customRole);
        setUserRole(roleName);
      } catch (error) {
        // Si no se puede traducir, usar el valor directo
        setUserRole(user.customRole);
      }
    }
  }, [user]);

  // Filtrar rutas según módulos activos
  useEffect(() => {
    if (!userRole) {
      setFilteredRoutes([]);
      return;
    }

    // Verificar si el usuario puede acceder al área administrativa
    const canAccess = canAccessAdminModule(userRole as any);
    if (!canAccess) {
      setFilteredRoutes([]);
      return;
    }

    const filtered = ADMIN_ROUTES.filter(route => {
      // Verificar si el módulo está activo para este rol
      const moduleActive = isModuleActive(userRole as any, route.module);
      
      if (route.subRoutes) {
        // Para rutas con submenús, verificar si al menos una subruta está activa
        const hasActiveSubroute = route.subRoutes.some(subRoute => 
          isModuleActive(userRole as any, subRoute.module)
        );
        return moduleActive && hasActiveSubroute;
      }
      
      return moduleActive;
    }).map(route => {
      // Filtrar subRutas también
      if (route.subRoutes) {
        const activeSubRoutes = route.subRoutes.filter(subRoute =>
          isModuleActive(userRole as any, subRoute.module)
        );
        return { ...route, subRoutes: activeSubRoutes };
      }
      return route;
    });

    setFilteredRoutes(filtered);

    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 AdminSidebarRoutes Debug:', {
        userRole,
        canAccess,
        totalRoutes: ADMIN_ROUTES.length,
        filteredRoutes: filtered.length,
        activeModules: filtered.map(r => r.module)
      });
    }
  }, [userRole]);

  // Auto-expandir menús activos
  useEffect(() => {
    filteredRoutes.forEach((route) => {
      if (route.subRoutes && route.isCollapsible) {
        route.subRoutes.forEach((sub) => {
          if (pathname === sub.href || pathname.startsWith(`${sub.href}/`)) {
            setExpandedMenus((prev) =>
              prev.includes(route.label) ? prev : [...prev, route.label]
            );
          }
        });
      }
    });
  }, [pathname, filteredRoutes]);

  // Animaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      filteredRoutes.forEach((route, idx) => {
        if (route.href) {
          setTimeout(
            () => setAnimatedItems((prev) => [...prev, route.href!]),
            idx * 100
          );
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [filteredRoutes]);

  const isNewFeature = useCallback(
    (until?: Date) => (until ? new Date() <= until : false),
    []
  );

  const toggleMenu = (label: string) =>
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const isActive = useCallback(
    (route: AdminRoute | AdminSubRoute) =>
      !!route.href &&
      (pathname === route.href || pathname.startsWith(`${route.href}/`)),
    [pathname]
  );

  const variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const subVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  return (
    <div className={`${isCollapsed ? "px-2" : "px-4"} py-2 text-white`}>
      {!isCollapsed && (
        <>
          <div className="flex items-center justify-between mb-4">
            <Label className="uppercase text-white text-xs tracking-wider font-semibold">
              Módulos Administrativos
            </Label>
          </div>
          <Separator className="mb-4 border-white/40" />
        </>
      )}

      <nav className="space-y-2">
        <AnimatePresence>
          {filteredRoutes.map((route) => {
            const animated = !!route.href && animatedItems.includes(route.href);
            const active = isActive(route);
            const expanded = expandedMenus.includes(route.label);

            if (route.isCollapsible && route.subRoutes) {
              return (
                <motion.div
                  key={route.label}
                  className="space-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={variants}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`flex items-center px-3 py-3 text-sm rounded-xl cursor-pointer transition-all duration-200 group hover:bg-white/10`}
                    onClick={() => toggleMenu(route.label)}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <route.icon
                            className={
                              "h-5 w-5 flex-shrink-0 transition-colors text-white"
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-primary text-white"
                        >
                          {route.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {!isCollapsed && (
                      <div className="flex-1 ml-3 flex items-center justify-between min-w-0">
                        <span className="font-medium truncate text-sm leading-5 text-white">
                          {route.label}
                        </span>
                        {expanded ? (
                          <ChevronDown className="h-4 w-4 ml-2 text-white" />
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-2 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {expanded && !isCollapsed && (
                    <motion.div
                      className="pl-8 mt-2 space-y-1 border-l-2 border-white/30 ml-6"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={subVariants}
                    >
                      {route.subRoutes.map((sub) => (
                        <motion.div key={sub.href} variants={variants}>
                          <SidebarItem
                            href={sub.href}
                            icon={sub.icon}
                            isAnimated={animated}
                            isCollapsed={isCollapsed}
                            label={
                              <div className="flex items-center w-full min-w-0">
                                <span className="flex-1 text-xs font-medium truncate leading-4 text-white">
                                  {sub.label}
                                </span>
                              </div>
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={route.href || route.label}
                initial="hidden"
                animate="visible"
                variants={variants}
                transition={{ duration: 0.3 }}
              >
                <SidebarItem
                  href={route.href || "#"}
                  icon={route.icon}
                  isAnimated={animated}
                  isCollapsed={isCollapsed}
                  label={
                    <div className="flex items-center w-full min-w-0 text-white">
                      <span className="flex-1 text-sm font-medium truncate leading-5">
                        {route.label}
                      </span>
                      {route.badge?.viewLabel &&
                        isNewFeature(route.badge.until) && (
                          <Badge className="ml-2 bg-white text-red-600 text-xs px-2 py-0.5 flex-shrink-0">
                            {route.badge.textLabel}
                          </Badge>
                        )}
                    </div>
                  }
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

      {/* Mensaje si no hay módulos activos */}
      {filteredRoutes.length === 0 && !isCollapsed && (
        <div className="px-3 py-6 text-center">
          <p className="text-white/60 text-sm">
            No hay módulos administrativos disponibles
          </p>
          <p className="text-white/40 text-xs mt-1">
            Contacte al administrador para activar funciones
          </p>
        </div>
      )}
    </div>
  );
};