// app/(course)/courses/catalog/CatalogHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
} from "lucide-react"; // Renombrado BookOpen para evitar conflicto
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { Logo } from "@/utils/logo";
import { createClient } from "@/utils/supabase/client";

export default function CatalogHeader() {
  const [user, setUser] = useState<UserDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUserFromDB();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth";
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Logo version="original" width={100} height={40} />
            </Link>
            <Link
              href="/courses/catalog"
              className="ml-4 text-xl font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400"
            >
              Catálogo de Cursos
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 hidden md:block"
            >
              Inicio
            </Link>
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.metadata?.avatar || undefined}
                        alt={user.fullName || "Usuario"}
                      />
                      <AvatarFallback>
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Mi Panel</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* Asumiendo que /search es donde ven sus cursos inscritos o una página similar */}
                    <Link href="/search" className="cursor-pointer">
                      <MyCoursesIcon className="mr-2 h-4 w-4" />
                      <span>Mis Cursos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-700/20 dark:focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="bg-sky-600 hover:bg-sky-700">
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
