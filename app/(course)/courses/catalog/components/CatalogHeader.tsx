// app/(course)/courses/catalog/components/CatalogHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { LogOut, User as UserIcon, BookOpen as MyCoursesIcon, Home as HomeIcon } from "lucide-react";
import { getCurrentUserFromDB, UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { Logo } from "@/utils/logo";
import { createClient } from "@/utils/supabase/client";

export default function CatalogHeader() {
  const [user, setUser] = useState<UserDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const currentUser = await getCurrentUserFromDB();
        if (mounted) setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user in CatalogHeader:", error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    startTransition(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error.message);
      }
      setUser(null);
      router.replace("/auth");
      router.refresh();
    });
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return "U";
    const clean = name
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // sin acentos
    if (!clean) return "U";
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const mainSite = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.infectotropico.com/";

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <a href="#catalog-content" className="sr-only focus:not-sr-only focus:block p-2">
        Saltar al contenido
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Izquierda: Logo + título */}
          <div className="flex items-center gap-4">
            <Link
              href={mainSite}
              aria-label="Ir al sitio principal"
              className="flex-shrink-0"
            >
              <Logo version="original" width={56} height={56} />
            </Link>

            <div className="hidden border-l pl-4 md:block dark:border-slate-700">
              <Link
                href="/courses/catalog"
                className="text-base font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              >
                Catálogo de Cursos
              </Link>
            </div>
          </div>

          {/* Derecha: Navegación / Usuario */}
          <nav
            aria-label="Acciones de usuario"
            className="flex items-center gap-2 sm:gap-3"
            role="navigation"
          >
            {user && (
              <Link
                href={user.customRole === "teacher" ? "/teacher" : "/students"}
                title="Ir al panel"
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              >
                <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Panel</span>
              </Link>
            )}

            {/* Loading */}
            {isLoading ? (
              <div
                aria-live="polite"
                className="flex items-center gap-2"
              >
                <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-200 sm:block dark:bg-slate-700" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0"
                    aria-label="Abrir menú de usuario"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.metadata?.avatar_url || undefined}
                        alt={user.fullName || user.username || "Avatar de usuario"}
                      />
                      <AvatarFallback className="text-sm">
                        {getInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  forceMount
                  className="w-64 rounded-lg bg-white shadow-lg dark:bg-slate-800"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 p-1">
                      <p className="truncate text-sm font-semibold leading-none">
                        {user.fullName || user.username || "Usuario"}
                      </p>
                      <p className="truncate text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/catalogo" className="flex w-full items-center">
                      <MyCoursesIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Mis Cursos</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/30"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isPending ? "Cerrando…" : "Cerrar Sesión"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/auth">Iniciar Sesión</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  <Link href="/auth?action=sign_up">Registrarse</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Anchor para "Saltar al contenido" */}
      <div id="catalog-content" />
    </header>
  );
}
