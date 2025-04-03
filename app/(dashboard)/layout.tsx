"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./_components/sidebar";
import { MenuIcon } from "lucide-react";
import { printDebug } from "@/utils/debug/log";
import {
  getAdminId,
  getStudentId,
  getTeacherId,
  getVisitorId,
} from "@/utils/roles/translate";
import { getCurrentUserFromDB } from "../auth/CurrentUser/getCurrentUserFromDB";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const metaDataPage = {
  title: "dashboard",
  route: "app/(dashboard)/layout.tsx",
  index: 1,
};

printDebug(`${metaDataPage.index} ${metaDataPage.route}`);

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const router = useRouter();

  const toggleSidebar = (state?: boolean) => {
    setIsSidebarOpen(state !== undefined ? state : !isSidebarOpen);
  };

  useEffect(() => {
    (async () => {
      printDebug("🔍 Iniciando validación del usuario desde tabla User");

      const user = await getCurrentUserFromDB();
      printDebug(`🧑 Usuario desde BD: ${JSON.stringify(user)}`);

      if (!user) {
        console.warn("❌ Usuario no autenticado o no encontrado");
        const confirmed = confirm("Tu sesión ha expirado. ¿Deseas iniciar sesión?");
        if (confirmed) router.push("/auth");
        return;
      }

      const role = user.customRole;
      printDebug(`🔐 Rol obtenido: ${role}`);

      const allowedRoles = [getTeacherId(), getAdminId(), getStudentId(), getVisitorId()];
      const hasAccess = allowedRoles.includes(role);

      printDebug(`✅ Acceso permitido: ${hasAccess}`);

      if (!hasAccess) {
        console.warn("⛔ Rol no autorizado");
        const confirmed = confirm("No tienes permisos para acceder a esta página. ¿Deseas iniciar sesión?");
        if (confirmed) router.push("/auth");
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
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-56" : "w-0"
        } h-full flex-col fixed inset-y-0 z-30 transition-all duration-300 overflow-hidden`}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Botón para abrir Sidebar */}
      {!isSidebarOpen && (
        <button
          onClick={() => toggleSidebar(true)}
          className={`fixed bottom-5 left-3 z-40 p-3 rounded-full shadow-lg ${
            isUserTeacher ? "bg-orange-500 text-white" : "bg-[#386329] text-white"
          }`}
        >
          <MenuIcon />
        </button>
      )}

      {/* Contenido principal */}
      <main
        className={`${
          isSidebarOpen ? "md:pl-56" : ""
        } h-full overflow-y-auto transition-all duration-300`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
