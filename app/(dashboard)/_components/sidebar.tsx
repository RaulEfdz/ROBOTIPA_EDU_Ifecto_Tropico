"use client";

import { useState, useEffect } from "react";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { Logo } from "./logo";
import { SidebarRoutes } from "./SidebarRoutes";
import Administrative from "@/components/Administrative";
import { ChevronLeft } from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";

export const Sidebar = ({
  toggleSidebar,
}: {
  toggleSidebar: (state?: boolean) => void;
}) => {
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const [user, setUser] = useState<UserDB | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUserAndCheckRole = async () => {
      const currentUser = await getCurrentUserFromDB();
      setUser(currentUser);
      if (currentUser?.id) {
        const result = await isTeacher(currentUser.id);
        setIsUserTeacher(result);
      }
    };
    fetchUserAndCheckRole();
  }, []);

  // Dark gradient tones
  const gradientClasses = isUserTeacher
    ? "from-gray-900 to-gray-800"
    : "from-gray-800 to-gray-700";

  return (
    <aside
      className={`bg-slate-100 w-full md:w-56 h-full flex flex-col bg-gradient-to-b ${gradientClasses} text-white shadow-xl transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <Logo />
        </div>

        <button
          onClick={() => toggleSidebar(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 md:flex hidden items-center justify-center"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={22}
            className={`transition-transform duration-200 ${
              isHovered ? "-translate-x-1 scale-110" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-0 py-3 space-y-1 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        <SidebarRoutes />
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="px-4 py-4 border-t border-white/20">
          <Administrative />
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-sm font-light bg-white/10">
          <span>ROBOTIPA_LMS</span>
          <span>v19.5.25</span>
        </div>
      </div>
    </aside>
  );
};
