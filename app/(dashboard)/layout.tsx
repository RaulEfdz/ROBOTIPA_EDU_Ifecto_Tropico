// app/(dashboard)/layout.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { printDebug } from "@/utils/debug/log";
import {
  getAdminId,
  getStudentId,
  getTeacherId,
  getVisitorId,
} from "@/utils/roles/translate";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { Sidebar } from "./_components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const router = useRouter();

  const toggleSidebar = (state?: boolean) =>
    setIsSidebarOpen(state !== undefined ? state : !isSidebarOpen);
  
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    (async () => {
      printDebug("🔍 Iniciando validación del usuario desde tabla User");

      const user = await getCurrentUserFromDB();
      printDebug(`🧑 Usuario desde BD: ${JSON.stringify(user)}`);

      if (!user) {
        console.warn("❌ Usuario no autenticado o no encontrado");
        if (confirm("Tu sesión ha expirado. ¿Deseas iniciar sesión?")) {
          router.push("/auth");
        }
        return;
      }

      const role = user.customRole;
      printDebug(`🔐 Rol obtenido: ${role}`);

      const allowedRoles = [
        getTeacherId(),
        getAdminId(),
        getStudentId(),
        getVisitorId(),
      ];
      const hasAccess = allowedRoles.includes(role);

      printDebug(`✅ Acceso permitido: ${hasAccess}`);

      if (!hasAccess) {
        console.warn("⛔ Rol no autorizado");
        if (
          confirm(
            "No tienes permisos para acceder a esta página. ¿Deseas iniciar sesión?"
          )
        ) {
          router.push("/auth");
        }
        return;
      }

      printDebug("📡 Sincronizando usuario con base de datos vía API");
      const response = await fetch("/api/auth/insertUser");
      const result = await response.json();
      printDebug(`🗂 Resultado insertUser: ${JSON.stringify(result)}`);

      setIsUserTeacher(hasAccess);
    })();
  }, [router]);

  return (
    <div className="h-full bg-gradient">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
      />
      {/* Mobile only backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => toggleSidebar(false)}
          aria-label="Cerrar menú"
        />
      )}
      {/* Mobile open button */}
      {!isSidebarOpen && (
        <button
          onClick={() => toggleSidebar(true)}
          className={`fixed bottom-5 left-3 z-40 p-3 rounded-full shadow-lg md:hidden ${
            isUserTeacher
              ? "bg-primaryCustom2 text-TextCustom"
              : "bg-[#386329] text-TextCustom"
          }`}
          aria-label="Abrir menú"
        >
          <MenuIcon size={24} />
        </button>
      )}
      <main
        className={`h-full overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
