"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Compass,
  Bell,
  HelpCircle,
  List,
  Folder,
  Brain,
  Users,
  UserCheck,
  UserPlus,
  BarChart,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { guestRoutes, Route, SubRoute, teacherRoutes } from "./routes";

export const SidebarRoutes = () => {
  const pathname = usePathname() || "/";
  const isTeacherPage =
    pathname.startsWith("/teacher") || pathname.startsWith("/admin");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [showBadges, setShowBadges] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>(routes);

  // Reset filtered routes on context switch
  useEffect(() => setFilteredRoutes(routes), [routes]);

  // Auto-expand active submenu
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

  // Hide badges after 10s
  useEffect(() => {
    const timer = setTimeout(() => setShowBadges(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Stagger animations
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

  // Filter on search
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
  }, [searchQuery, routes]);

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

  const toggleCollapse = () => setIsCollapsed((c) => !c);

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
    <div
      className={`pr-4 pl-2 py-2 transition-all duration-300 mr-2 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <Label className="uppercase text-white text-xs tracking-wide">
            Herramientas
          </Label>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <Separator className="mb-4" />

      {!isCollapsed && (
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border-0 rounded-md pl-8 py-2 text-sm focus:ring-2 focus:ring-white/20 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2.5 text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <nav className="space-y-2">
        <AnimatePresence>
          {filteredRoutes.map((route) => {
            const animated = !!route.href && animatedItems.includes(route.href);
            const active = isActive(route);
            const expanded = expandedMenus.includes(route.label);

            // Collapsible group
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
                    className={`flex items-center px-3 mr-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                      active ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                    onClick={() => toggleMenu(route.label)}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <route.icon className="h-5 w-5" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {route.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {!isCollapsed && (
                      <>
                        <span className="flex-1 ml-3 font-medium truncate">
                          {route.label}
                        </span>
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </div>

                  {expanded && !isCollapsed && (
                    <motion.div
                      className="pl-7 space-y-1"
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
                            label={
                              <div className="flex items-center space-x-3 w-full">
                                <span className="flex-1 text-sm font-medium truncate">
                                  {sub.label}
                                </span>
                                {showBadges &&
                                  sub.badge?.viewLabel &&
                                  isNewFeature(sub.badge.until) && (
                                    <span
                                      className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 ${sub.badge.color}`}
                                    >
                                      {sub.badge.textLabel}
                                    </span>
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

            // Single link
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
                  label={
                    <div className="flex items-center space-x-3 w-full">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipContent side="right">
                            {route.label}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {!isCollapsed && (
                        <span className="flex-1 text-sm font-medium truncate ml-3">
                          {route.label}
                        </span>
                      )}

                      {showBadges &&
                        !isCollapsed &&
                        route.badge?.viewLabel &&
                        isNewFeature(route.badge.until) && (
                          <span
                            className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 ${route.badge.color}`}
                          >
                            {route.badge.textLabel}
                          </span>
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
