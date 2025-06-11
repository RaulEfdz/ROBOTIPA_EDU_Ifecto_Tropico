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
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
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

  // Usar gradiente institucional o fondo base según la guía de estilos
  const sidebarBg =
    "bg-gradient-to-b from-brand-primary to-brand-accent text-heading";

  return (
    <aside
      className={
        `fixed inset-y-0 left-0 z-30 transform ${sidebarBg} w-64 md:w-56 border-r border-default shadow-card ` +
        `transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 font-[Renogare Soft, ChaletBook, sans-serif]`
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-default">
        <Logo />
        {/* Close only on mobile */}
        <button
          onClick={() => toggleSidebar(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="md:hidden btn-secondary p-2 rounded-full transition-all duration-200"
          aria-label="Cerrar menú"
        >
          <ChevronLeft
            size={22}
            className={`transition-transform duration-200 text-brand-primary ${
              isHovered ? "-translate-x-1 scale-110" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 scrollbar-thin scrollbar-thumb-brand-accent/30 scrollbar-track-transparent">
        <SidebarRoutes />
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="px-4 py-4 border-t border-default bg-base">
          <Administrative />
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-caption bg-base border-t border-default">
          <span className="text-brand-primary font-light text-xs">
            ROBOTIPA_LMS
          </span>
          <span className="text-brand-primary font-light text-xs">
            v 25.11.05
          </span>
        </div>
      </div>
    </aside>
  );
};
