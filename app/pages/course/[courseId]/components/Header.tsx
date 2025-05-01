"use client";

import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

interface HeaderProps {
  user?: UserDB | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <Link
          href="/search"
          className="flex items-center gap-2 font-bold text-emerald-600 text-xl"
        >
          <BookOpen size={24} />
          <span>Trenning</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-gray-600 hover:text-emerald-600 font-medium"
          >
            Cursos
          </Link>

          {user && (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm text-gray-600">
                {user.fullName || user.username}
              </span>
              <form method="POST" action="/api/auth/logout">
                <Button variant="ghost" size="icon" title="Cerrar sesión">
                  <LogOut size={18} />
                </Button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
