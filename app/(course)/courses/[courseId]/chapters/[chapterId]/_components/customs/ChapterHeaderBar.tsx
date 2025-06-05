"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { Logo } from "@/utils/logo";

export default function ChapterHeaderBar() {
  const [user, setUser] = useState<UserDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUserFromDB();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 h-16 sm:h-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="flex justify-between items-center w-full">
          {/* Left section - Logo */}
          <Link
            href="/"
            className="flex-shrink-0 scale-75 sm:scale-100 origin-left"
          >
            <Logo version="original" />
          </Link>

          {/* Middle section - Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 mx-2 sm:mx-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-1 sm:gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Volver a cursos</span>
            </Link>

            <div className="h-5 sm:h-6 w-px bg-gray-200 mx-1 sm:mx-2 hidden sm:block" />

            <div className="flex items-center gap-1 sm:gap-2 font-bold text-emerald-600 text-base sm:text-lg">
              <BookOpen size={18} className="flex-shrink-0" />
              <span>Capítulo</span>
            </div>
          </div>

          {/* Right section - User info */}
          <div className="flex items-center">
            {isLoading ? (
              <div className="w-16 sm:w-24 h-3 sm:h-4 bg-gray-100 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline max-w-32 lg:max-w-full truncate">
                  {user.fullName || user.username}
                </span>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                >
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
