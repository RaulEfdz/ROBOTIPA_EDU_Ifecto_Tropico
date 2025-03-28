'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from "./_components/sidebar";
import { MenuIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { isTeacher } from './(routes)/admin/teacher';

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = (state?: boolean) => {
    if (state !== undefined) {
      setIsSidebarOpen(state);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

    const { user } = useUser();
    const [isUserTeacher, setIsUserTeacher] = useState(false);
  
    useEffect(() => {
      const checkTeacherStatus = async () => {
        if (user?.id) {
          const result = await isTeacher(user.id); // Asegúrate de que isTeacher devuelve una promesa.
          setIsUserTeacher(result);
        }
      };
      checkTeacherStatus();
    }, [user]);

  return (
    <div className="h-full bg-gradient">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-56' : 'w-0'} h-full flex-col fixed inset-y-0 z-30 transition-all duration-300 overflow-hidden`}>
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Floating Button for Sidebar */}
      {!isSidebarOpen && (
        <button
          onClick={() => toggleSidebar(true)}
          className={`fixed bottom-5 left-3 z-40 p-3 rounded-full shadow-lg ${
            isUserTeacher ? "bg-orange-500 text-white" : "bg-[#386329] text-white"
          }`}
        >
          <MenuIcon/>
        </button>
      )}

      {/* Main Content */}
      <main className={`${isSidebarOpen ? 'md:pl-56' : ''}  h-full overflow-y-auto transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
