// app/(course)/courses/catalog/components/CatalogHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importar useRouter
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  BookOpen as MyCoursesIcon,
  HomeIcon, // Para el botón de Inicio
} from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { Logo } from "@/utils/logo";
import { createClient } from "@/utils/supabase/client";

export default function CatalogHeader() {
  const [user, setUser] = useState<UserDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // Inicializar useRouter
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUserFromDB();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user in CatalogHeader:", error);
        setUser(null); // Asegurar que user sea null en caso de error
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during logout:", error.message);
      // Podrías mostrar un toast de error aquí
    }
    setUser(null);
    router.push("/auth"); // Usar router para la navegación
    router.refresh(); // Para asegurar que el estado del servidor se actualice
  };

  const getInitials = (name?: string | null): string => {
    if (!name || name.trim() === "") return "U"; // "U" de Usuario como fallback
    const nameParts = name.split(" ").filter(Boolean); // Filtra partes vacías
    if (nameParts.length === 0) return "U";
    if (nameParts.length === 1)
      return nameParts[0].substring(0, 2).toUpperCase();
    return (
      nameParts[0][0] + (nameParts[nameParts.length - 1][0] || "")
    ).toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 border-b dark:border-slate-700">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* max-w-screen-xl para más ancho */}
        <div className="flex items-center justify-between h-16">
          {/* Sección Izquierda: Logo y Título del Catálogo */}
          <div className="flex items-center">
            <Link href="https://www.infectotropico.com/" className="flex-shrink-0">
              <Logo version="original" width={60} height={60} />{" "}
            </Link>
            {/* Título "Catálogo de Cursos" */}
            <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 hidden md:block">
              <Link
                href="/courses/catalog"
                className="text-base font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Catálogo de Cursos
              </Link>
            </div>
          </div>

          {/* Sección Derecha: Navegación y Usuario */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Botón de Inicio (solo si hay sesión) */}
            {user && (
              <Link
                href={user.customRole === 'teacher' ? '/teacher' : '/students'}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 flex items-center gap-1"
                title="Ir al tablero"
              >
                <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Panel</span>
              </Link>
            )}

            {/* Estado de Carga o Menú de Usuario/Botones de Login */}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse hidden sm:block"></div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 bg-white "
                  >
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      <AvatarImage
                        src={user.metadata?.avatar_url || undefined} // Campo estándar de Supabase para avatar
                        alt={
                          user.fullName || user.username || "Avatar de usuario"
                        }
                      />
                      <AvatarFallback className="text-sm sm:text-base">
                        {getInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  // className=""
                  align="end"
                  forceMount
                  className="w-60 bg-white dark:bg-slate-800 shadow-lg rounded-lg"
                >
                  {" "}
                  {/* Aumentado ancho */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 p-1">
                      <p className="text-sm font-semibold leading-none truncate">
                        {user.fullName || user.username || "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer w-full flex items-center"
                    >
                      <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/catalogo"
                      className="cursor-pointer w-full flex items-center"
                    >
                      <MyCoursesIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Mis Cursos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-500 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-400 dark:focus:bg-red-900/30 w-full flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/auth">Iniciar Sesión</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                >
                  <Link href="/auth?action=sign_up">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
