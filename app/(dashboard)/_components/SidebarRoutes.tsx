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
import { guestRoutes, studentRoutes, Route, SubRoute, teacherRoutes } from "./routes";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SidebarRoutesProps {
  isCollapsed?: boolean;
}

export const SidebarRoutes = ({ isCollapsed = false }: SidebarRoutesProps) => {
  const pathname = usePathname() || "/";
  const { user } = useCurrentUser();
  
  const isTeacherPage =
    pathname.startsWith("/teacher") || 
    pathname.startsWith("/admin") ||
    pathname.startsWith("/exams");
  const isStudentPage = pathname.startsWith("/students");
  
  // Determinar qué rutas mostrar según el rol del usuario y la página actual
  let routes = guestRoutes; // Por defecto
  
  // Priorizar el rol del usuario sobre la URL
  if ((user as any)?.customRole === "teacher" || (user as any)?.customRole === "admin") {
    routes = teacherRoutes;
  } else if ((user as any)?.customRole === "student") {
    routes = studentRoutes;
  } else if (isTeacherPage) {
    // Si no hay usuario identificado pero está en ruta de teacher
    routes = teacherRoutes;
  } else if (isStudentPage) {
    // Si no hay usuario identificado pero está en ruta de student
    routes = studentRoutes;
  }

  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [showBadges, setShowBadges] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>(routes);

  useEffect(() => setFilteredRoutes(routes), [routes]);

  useEffect(() => {
    routes.forEach((route) => {
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
  }, [pathname, routes]);

  useEffect(() => {
    const timer = setTimeout(() => setShowBadges(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      routes.forEach((route, idx) => {
        if (route.href) {
          setTimeout(
            () => setAnimatedItems((prev) => [...prev, route.href!]),
            idx * 100
          );
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [routes]);

  useEffect(() => {
    if (!searchQuery.trim()) return setFilteredRoutes(routes);

    const q = searchQuery.toLowerCase();
    const filtered = routes.filter((route) => {
      if (route.label.toLowerCase().includes(q)) return true;
      return (
        route.subRoutes?.some((sub) => sub.label.toLowerCase().includes(q)) ??
        false
      );
    });
    setFilteredRoutes(filtered);

    filtered.forEach((route) => {
      if (route.subRoutes && route.isCollapsible) {
        const match = route.subRoutes.some((sub) =>
          sub.label.toLowerCase().includes(q)
        );
        if (match && !expandedMenus.includes(route.label)) {
          setExpandedMenus((prev) => [...prev, route.label]);
        }
      }
    });
  }, [searchQuery, routes, expandedMenus]);

  const isNewFeature = useCallback(
    (until?: Date) => (until ? new Date() <= until : false),
    []
  );

  const toggleMenu = (label: string) =>
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const isActive = useCallback(
    (route: Route | SubRoute) =>
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
              Navegación
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
                    className={`flex items-center px-3 py-3 text-sm rounded-xl cursor-pointer transition-all duration-200 group `}
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
                                {showBadges &&
                                  sub.badge?.viewLabel &&
                                  isNewFeature(sub.badge.until) && (
                                    <Badge className="ml-2 bg-white text-white text-xs px-2 py-0.5">
                                      {sub.badge.textLabel}
                                    </Badge>
                                  )}
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
                      {showBadges &&
                        route.badge?.viewLabel &&
                        isNewFeature(route.badge.until) && (
                          <Badge className="ml-2  text-primary text-xs px-2 py-0.5 flex-shrink-0">
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
    </div>
  );
};
