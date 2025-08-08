// components/Sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { Logo } from "./logo";
import { SidebarRoutes } from "./SidebarRoutes";
import Administrative from "@/components/Administrative";
import { ChevronLeft } from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: (state?: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  isCollapsed,
  toggleCollapse,
}) => {
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const [user, setUser] = useState<UserDB | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function fetchUserAndCheckRole() {
      const currentUser = await getCurrentUserFromDB();
      setUser(currentUser);
      if (currentUser?.id) {
        const result = await isTeacher(currentUser.id);
        setIsUserTeacher(result);
      }
    }
    fetchUserAndCheckRole();
  }, []);

  return (
    <aside
      className={
        `fixed inset-y-0 left-0 z-30 transform ` +
        `${isCollapsed ? "w-16" : "w-64 md:w-64"} bg-primary shadow-2xl ` +
        `transition-all duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`
      }
    >
      {/* Header */}
      <div
        className={`flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-6"} py-6 border-b border-white/20 bg-gradient-to-r from-primary to-primary-600 text-white`}
      >
        {!isCollapsed && <Logo />}
        <div
          className={`flex items-center gap-2 ${isCollapsed ? "w-full justify-center" : ""}`}
        >
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden md:flex p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/10"
            aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-200 text-white ${
                isCollapsed ? "rotate-180" : ""
              } ${isHovered ? "scale-110" : ""}`}
            />
          </button>
          {/* Mobile close button */}
          {!isCollapsed && (
            <button
              onClick={() => toggleSidebar(false)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/10"
              aria-label="Cerrar menú"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-transparent text-white">
        <SidebarRoutes isCollapsed={isCollapsed} />
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="mt-auto text-white bg-gradient-to-t from-primary-800 to-primary">
          <div className="px-4 py-4 border-t border-white/20">
            <Administrative />
          </div>
          <div className="px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border-t border-white/10">
            ROBOTIPA EDU v2.0.1
          </div>
        </div>
      )}
    </aside>
  );
};
