'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from "./_components/sidebar";
import { MenuIcon } from 'lucide-react';
import { getUserData } from '../(auth)/auth/userCurrent';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserTeacher, setIsUserTeacher] = useState(false);

  const toggleSidebar = (state?: boolean) => {
    setIsSidebarOpen(state !== undefined ? state : !isSidebarOpen);
  };

  useEffect(() => {
    (async () => {
      // Obtenemos el rol personalizado del usuario
      const userData = await getUserData();
      const role = userData?.user.identities[0].identity_data.custom_role;
      console.log("customRole:", role);
      if (!role) return;
      const hasAccess = ["teacher", "admin", "developer"].includes(role);
      console.log("Rol verificado:", role, hasAccess);
      setIsUserTeacher(hasAccess);
    })();
  }, []);

  return (
    <div className="h-full bg-gradient">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-56' : 'w-0'
        } h-full flex-col fixed inset-y-0 z-30 transition-all duration-300 overflow-hidden`}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Botón flotante para mostrar el Sidebar */}
      {!isSidebarOpen && (
        <button
          onClick={() => toggleSidebar(true)}
          className={`fixed bottom-5 left-3 z-40 p-3 rounded-full shadow-lg ${
            isUserTeacher ? 'bg-orange-500 text-white' : 'bg-[#386329] text-white'
          }`}
        >
          <MenuIcon />
        </button>
      )}

      {/* Contenido principal */}
      <main
        className={`${isSidebarOpen ? 'md:pl-56' : ''} h-full overflow-y-auto transition-all duration-300`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
