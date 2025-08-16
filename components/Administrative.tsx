"use client";

import { usePathname, useRouter } from "next/navigation";
import { Book, Brain, LogOut, Navigation, User, ChevronDown, Shield, Puzzle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { getTeacherId, getAdminId, getRoleLabel, translateRole } from "@/utils/roles/translate";
import { canAccessAdminModule, hasMinimumRoleLevel, RoleName } from "@/utils/roles/hierarchy";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { createClient } from "@/utils/supabase/client";
import { getRoleStyles, mapRoleUUIDToColorRole } from "@/lib/role-colors";

export const Administrative = () => {
  const router = useRouter();
  const pathname = usePathname() || "";
  const supabase = createClient();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoleLabel, setUserRoleLabel] = useState<string>('');
  const [userColorRole, setUserColorRole] = useState<'default' | 'admin' | 'teacher' | 'student' | 'visitor'>('default');
  const [isTeacherUser, setIsTeacherUser] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const checkRole = useCallback(async () => {
    const user = await getCurrentUserFromDB();
    const roleUUID = user?.customRole;
    
    // Guardar el rol del usuario
    setUserRole(roleUUID || null);
    setUserRoleLabel(getRoleLabel(roleUUID));
    
    // Determinar esquema de colores basado en el rol
    if (roleUUID) {
      const colorRole = mapRoleUUIDToColorRole(roleUUID);
      setUserColorRole(colorRole);
    }
    
    if (!roleUUID) {
      setIsTeacherUser(false);
      setIsAdminUser(false);
      return;
    }

    // Traducir UUID a nombre de rol usando el traductor
    let roleName: string;
    try {
      roleName = translateRole(roleUUID);
    } catch (error) {
      // Si no se puede traducir, asumir que ya es un nombre de rol
      roleName = roleUUID;
    }

    // Usar el sistema de jerarquía para verificar permisos
    const isAdminUser = canAccessAdminModule(roleName as RoleName);
    const isTeacherUser = hasMinimumRoleLevel(roleName as RoleName, 'teacher');
    
    setIsAdminUser(isAdminUser);
    setIsTeacherUser(isTeacherUser);
    
    // Debug para verificar (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug Administrative roles:', {
        roleUUID,
        roleName,
        isAdminUser,
        isTeacherUser,
        roleLabel: getRoleLabel(roleUUID)
      });
    }
  }, []);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  const isTeacherPage = pathname.startsWith("/teacher");
  const isProfilePage = pathname.includes("/profile");
  const isStudentsPage = pathname === "/students";
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminManagementPage = pathname === "/admin/management";

  // Obtener estilos del rol (usar admin si estamos en área administrativa)
  const currentRole = isAdminPage ? 'admin' : userColorRole;
  const roleStyles = getRoleStyles(currentRole);

  const handleChange = async (value: string) => {
    switch (value) {
      case "areaTeachers":
        router.push("/teacher");
        break;
      case "areaStudents":
        router.push("/students");
        break;
      case "areaAdmin":
        router.push("/admin/management");
        break;
      case "moduleStatus":
        router.push("/admin/modules");
        break;
      case "areaProfile":
        router.push("/profile");
        break;
      case "logout":
        await supabase.auth.signOut();
        router.push("/auth");
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="w-full px-1 sm:px-0"
      role="navigation"
      aria-label="Menú de navegación"
      style={roleStyles}
    >
      <Select onValueChange={handleChange}>
        <SelectTrigger
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium group [&>svg]:hidden transition-all duration-200 border"
          style={{
            background: 'var(--role-surface)',
            borderColor: 'var(--role-border)',
            color: 'var(--role-text)',
          }}
          aria-label="Abrir menú de navegación"
        >
          <div className="flex items-center justify-between w-full ">
            <div className="flex items-center gap-1.5 sm:gap-2 ">
              <div 
                className="p-1 rounded-md transition-colors "
                style={{
                  background: 'var(--role-accent)',
                }}
              >
                <Navigation
                  size={14}
                  className="sm:size-4 "
                  style={{ color: 'var(--role-text) !important' }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col">
                <span 
                  className="font-medium truncate text-left"
                  style={{ color: 'var(--role-text) !important' }}
                >
                  {isAdminPage ? 'Panel Admin' : 'Navegación'}
                </span>
                <span 
                  className="text-xs truncate"
                  style={{ color: 'var(--role-text-secondary)' }}
                >
                  {userRoleLabel}
                </span>
              </div>
            </div>
            <ChevronDown
              size={12}
              className="sm:size-3.5 transition-colors flex-shrink-0 group-hover:scale-110"
              style={{ color: 'var(--role-text-secondary)' }}
            />
          </div>
        </SelectTrigger>

        <SelectContent 
          className="rounded-lg shadow-xl backdrop-blur-sm min-w-[200px] sm:min-w-[220px] max-w-[280px] border px-1"
          
        >
          {isAdminUser && !isAdminManagementPage && (
            <SelectItem
              value="areaAdmin"
              aria-label="Ir a Administración"
              className="text-white transition-colors duration-200 rounded-md mx-1 my-0.5 text-left justify-start pl-2 cursor-pointer hover:bg-[var(--role-hover)]"
            
            >
              <div 
                className=" flex items-center gap-2 sm:gap-3 py-1 rounded-md transition-colors"
           
              >
                <div 
                  className="p-1 sm:p-1.5 rounded-md"
             
                >
                  <Shield 
                    size={14} 
                    className="sm:size-4"
                  />
                </div>
                <span 
                  className="font-medium text-sm sm:text-base truncate"
                >
                  Área Administrador
                </span>
              </div>
            </SelectItem>
          )}
          {isTeacherUser && !isTeacherPage && (
            <SelectItem
              value="areaTeachers"
              aria-label="Ir a Profesores"
              className="transition-colors duration-200 rounded-md mx-1 my-0.5 text-left justify-start pl-2 cursor-pointer hover:bg-[var(--role-hover)]"
              style={{ color: 'var(--role-text) !important' }}
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div 
                  className="p-1 sm:p-1.5 rounded-md"
                  style={{ background: 'var(--role-accent)' }}
                >
                  <Book 
                    size={14} 
                    className="sm:size-4"
                    style={{ color: 'var(--role-text) !important' }}
                  />
                </div>
                <span 
                  className="font-medium text-sm sm:text-base truncate"
                  style={{ color: 'var(--role-text) !important' }}
                >
                  Área Profesores
                </span>
              </div>
            </SelectItem>
          )}
          {isAdminUser && isAdminPage && (
            <SelectItem
              value="moduleStatus"
              aria-label="Ver Estado de Módulos"
              className="transition-colors duration-200 rounded-md mx-1 my-0.5 text-left justify-start pl-2 cursor-pointer hover:bg-[var(--role-hover)]"
              style={{ color: 'var(--role-text) !important' }}
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div 
                  className="p-1 sm:p-1.5 rounded-md"
                  style={{ background: 'var(--role-accent)' }}
                >
                  <Puzzle 
                    size={14} 
                    className="sm:size-4"
                    style={{ color: 'var(--role-text) !important' }}
                  />
                </div>
                <span 
                  className="font-medium text-sm sm:text-base truncate"
                  style={{ color: 'var(--role-text) !important' }}
                >
                  Estado de Módulos
                </span>
              </div>
            </SelectItem>
          )}
          {!isStudentsPage && (
            <SelectItem
              value="areaStudents"
              aria-label="Ir a Estudiantes"
              className=" text-white transition-colors duration-200 rounded-md mx-1 my-0.5 text-left justify-start pl-2 cursor-pointer hover:bg-[var(--role-hover)]"
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div 
                  className="p-1 sm:p-1.5 rounded-md"
                >
                  <Brain 
                    size={14} 
                    className="sm:size-4"
                    style={{ color: 'var(--role-text) !important' }}
                  />
                </div>
                <span 
                  className="font-medium text-sm sm:text-base truncate"
                  style={{ color: 'var(--role-text) !important' }}
                >
                  Área Estudiantes
                </span>
              </div>
            </SelectItem>
          )}
          {!isProfilePage && (
            <SelectItem
              value="areaProfile"
              aria-label="Ir a Mis Datos"
              className="text-white transition-colors duration-200 rounded-md mx-1 my-0.5 text-left justify-start pl-2 cursor-pointer hover:bg-[var(--role-hover)]"
            >
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                <div 
                  className="p-1 sm:p-1.5 rounded-md"
                >
                  <User 
                    size={14} 
                    className="sm:size-4"
                    style={{ color: 'var(--role-text) !important' }}
                  />
                </div>
                <span 
                  className="font-medium text-sm sm:text-base truncate"
                  style={{ color: 'var(--role-text) !important' }}
                >
                  Mi Perfil
                </span>
              </div>
            </SelectItem>
          )}
          <div 
            className="border-t my-1"
            style={{ borderColor: 'var(--role-border)' }}
          ></div>
          <SelectItem
            value="logout"
            aria-label="Cerrar sesión"
            className="text-white transition-colors duration-200 rounded-md mx-1 my-0.5 text-left justify-start pl-2 cursor-pointer hover:bg-red-600/20"
          >
            <div className="flex items-center gap-2 sm:gap-3 py-1">
              <div className="p-1 sm:p-1.5 rounded-md bg-red-500/20">
                <LogOut 
                  size={14} 
                  className="sm:size-4 text-red-400" 
                />
              </div>
              <span 
                className="font-medium text-sm sm:text-base truncate"
              >
                Cerrar Sesión
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Administrative;
