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
  toggleCollapse 
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
        `fixed inset-y-0 left-0 z-30 transform bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 ` +
        `${isCollapsed ? 'w-16' : 'w-64 md:w-64'} border-r border-emerald-700/30 shadow-2xl ` +
        `transition-all duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`
      }
    >
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} py-5 border-b border-emerald-700/30 bg-emerald-800/50`}>
        {!isCollapsed && <Logo />}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'w-full justify-center' : ''}`}>
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden md:flex p-2 rounded-lg bg-emerald-700/30 hover:bg-emerald-600/40 transition-all duration-200"
            aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-200 text-emerald-100 ${
                isCollapsed ? "rotate-180" : ""
              } ${
                isHovered ? "scale-110" : ""
              }`}
            />
          </button>
          {/* Mobile close button */}
          {!isCollapsed && (
            <button
              onClick={() => toggleSidebar(false)}
              className="md:hidden p-2 rounded-lg bg-emerald-700/30 hover:bg-emerald-600/40 transition-all duration-200"
              aria-label="Cerrar menú"
            >
              <ChevronLeft
                size={18}
                className="text-emerald-100"
              />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
        <SidebarRoutes isCollapsed={isCollapsed} />
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="mt-auto">
          <div className="px-4 py-4 border-t border-emerald-700/30 bg-emerald-800/30">
            <Administrative />
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-700/20 bg-emerald-900/50">
            <span className="text-emerald-200 font-medium text-xs tracking-wide">
              ROBOTIPA_LMS
            </span>
            <span className="text-emerald-300 font-light text-xs">
              v25.7.2
            </span>
          </div>
          <div className="mt-8 text-center text-xs text-gray-500">
            {process.env.NEXT_PUBLIC_NAME_APP || "INFECTOTRÓPICO"} v{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
          </div>
        </div>
      )}
    </aside>
  );
};
