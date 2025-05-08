// File: app/pages/course/[courseId]/components/Header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB"; // Ajusta la ruta
import { Logo } from "@/utils/logo"; // Ajusta la ruta
import {
  Home,
  BookCopy,
  Search,
  LogIn as LogInIcon,
  UserCircle2,
} from "lucide-react";

interface HeaderProps {
  user: UserDB | null;
  courseTitle?: string; // Opcional
}

export default function Header({ user, courseTitle }: HeaderProps) {
  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0">
              <Logo width={90} height={30} version="original" />
            </Link>
            {courseTitle && (
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                |   {courseTitle}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link
              href="/"
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Home size={16} />{" "}
                <span className="hidden sm:inline">Inicio</span>
              </Button>
            </Link>
            <Link
              href="/courses/catalog"
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <BookCopy size={16} />{" "}
                <span className="hidden sm:inline">Catálogo</span>
              </Button>
            </Link>
            <Link
              href="/search"
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Search size={16} />{" "}
                <span className="hidden sm:inline">Buscar</span>
              </Button>
            </Link>

            {user ? (
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-transparent hover:ring-emerald-500 transition-all">
                  <AvatarImage src={user.metadata?.avatar || undefined} />
                  <AvatarFallback className="bg-emerald-500 text-white text-xs">
                    {getInitials(user.fullName || user.username)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/auth">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <LogInIcon size={16} /> Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
