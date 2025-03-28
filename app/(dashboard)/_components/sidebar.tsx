import { useState, useEffect } from "react";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { Logo } from "./logo";
import { useUser } from "@clerk/nextjs";
import { SidebarRoutes } from "./SidebarRoutes";
import Administrative from "@/components/Administrative";
import { SidebarClose } from "lucide-react";

export const Sidebar = ({ toggleSidebar }: { toggleSidebar: (state?: boolean) => void }) => {
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
    <div
      className={`border-r flex flex-col h-screen shadow-sm ${
        isUserTeacher ? "bg-orange-500 text-white" : "bg-[#386329] text-white"
      }`}
    >
      {/* Header con el logo y un botón para cerrar */}
      <div className="flex justify-between items-center h-[10%] p-5 ">
        <Logo />
        <button
          onClick={() => toggleSidebar(false)}
          className="mt-5 text-white rounded-full shadow-md hover:text-gray-50"
        >
          <SidebarClose/>
        </button>
      </div>

      {/* Rutas principales */}
      <div className="flex flex-col h-[80%] p-3">
        <SidebarRoutes />
      </div>

      {/* Pie de administración */}
      <div className="flex items-center justify-center h-[10%] p-3 mt-auto">
        <Administrative />
      </div>
       <span className="px-2 text-xs font-light py-2">ROBOTIPA_EDU {process.env.NEXT_PUBLIC_APP_VERSION}</span>
    </div>
  );
};
