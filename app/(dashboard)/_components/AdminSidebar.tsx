// app/(dashboard)/_components/AdminSidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { Logo } from "./logo";
import { AdminSidebarRoutes } from "./AdminSidebarRoutes";
import Administrative from "@/components/Administrative";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getRoleStyles } from "@/lib/role-colors";

export interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: (state?: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
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

  // Usar esquema de colores específico para admin
  const adminStyles = getRoleStyles('admin');

  return (
    <aside
      style={{
        ...adminStyles,
        background: 'var(--role-primary)',
        borderRight: '1px solid var(--role-border)',
      }}
      className={
        `fixed inset-y-0 left-0 z-30 transform ` +
        `${isCollapsed ? "w-16" : "w-64"} shadow-lg ` +
        `transition-all duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`
      }
    >
      {/* Header minimalista */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center px-3" : "justify-between px-6"
        } py-4 border-b`}
        style={{
          borderColor: 'var(--role-border)',
          background: 'var(--role-primary-dark)',
        }}
      >
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield size={18} style={{ color: 'var(--role-accent)' }} />
            <Logo />
          </div>
        )}

        {/* Indicador visual para collapsed */}
        {isCollapsed && (
          <Shield size={18} style={{ color: 'var(--role-accent)' }} />
        )}
        
        {/* Botón collapse */}
        <button
          onClick={toggleCollapse}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`${
            isCollapsed ? "w-8 h-8" : "w-7 h-7"
          } flex items-center justify-center rounded-md transition-all duration-200`}
          style={{
            background: isHovered ? 'var(--role-hover)' : 'transparent',
          }}
          aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {isCollapsed ? (
            <ChevronRight
              size={16}
              style={{ color: 'var(--role-text)' }}
              className="transition-transform duration-200"
            />
          ) : (
            <ChevronLeft
              size={16}
              style={{ color: 'var(--role-text)' }}
              className="transition-transform duration-200"
            />
          )}
        </button>

        {/* Mobile close button */}
        {!isCollapsed && (
          <button
            onClick={() => toggleSidebar(false)}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              background: 'var(--role-hover)',
            }}
            aria-label="Cerrar menú"
          >
            <ChevronLeft size={16} style={{ color: 'var(--role-text)' }} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-transparent"
        style={{
          scrollbarColor: 'var(--role-border) transparent',
        }}
      >
        <AdminSidebarRoutes isCollapsed={isCollapsed} user={user} />
      </nav>

      {/* Footer minimalista */}
      {!isCollapsed && (
        <div 
          className="mt-auto border-t"
          style={{
            borderColor: 'var(--role-border)',
            background: 'var(--role-primary-dark)',
          }}
        >
          <div className="px-4 py-3">
            <Administrative />
          </div>
          <div 
            className="px-4 py-2 text-center text-xs font-medium border-t"
            style={{
              color: 'var(--role-text-muted)',
              borderColor: 'var(--role-border)',
              background: 'var(--role-surface)',
            }}
          >
            ADMIN PANEL v2.0.1
          </div>
        </div>
      )}
    </aside>
  );
};