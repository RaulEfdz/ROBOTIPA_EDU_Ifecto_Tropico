"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  BookOpen, 
  LogOut, 
  ArrowLeft, 
  User, 
  Home, 
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getLogoUrlsSync } from "@/lib/dropbox";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isHexColor, getPrimaryColor, generateColorVariants } from "@/lib/colors";

export default function ChapterHeaderBar() {
  const [user, setUser] = useState<UserDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-data");
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error durante logout:", error);
    }
  };

  // Obtener URLs de logos
  const logoUrls = getLogoUrlsSync();

  // Obtener el nombre completo del usuario
  const getUserDisplayName = () => {
    if (!user) return "Usuario";
    
    return (
      user.fullName ||
      user.username ||
      user.email?.split("@")[0] ||
      "Usuario"
    );
  };

  // Obtener iniciales para el avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    const words = name.split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Obtener estilos dinámicos
  const getDynamicStyles = () => {
    const primaryColor = getPrimaryColor();
    
    if (isHexColor(primaryColor)) {
      const variants = generateColorVariants(primaryColor);
      return {
        primary: variants[600],
        primaryHover: variants[700],
        primaryLight: variants[100],
        primaryText: variants[700],
        isCustom: true,
      };
    }
    
    const colorName = primaryColor.toLowerCase();
    return {
      className: {
        primary: `bg-${colorName}-600`,
        primaryHover: `hover:bg-${colorName}-700`,
        primaryLight: `bg-${colorName}-100`,
        primaryText: `text-${colorName}-700`,
        primaryTextHover: `hover:text-${colorName}-700`,
      },
      isCustom: false,
    };
  };

  const styles = getDynamicStyles();

  return (
    <>
      <header className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            
            {/* Logo Section - Mejorado */}
            <div className="flex items-center gap-4 lg:gap-6">
              <Link
                href="/"
                className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
              >
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md group-hover:shadow-lg transition-all duration-200">
                  <Image
                    width={36}
                    height={36}
                    alt={`${process.env.NEXT_PUBLIC_NAME_APP || "ROBOTIPA EDU"} Logo`}
                    src={logoUrls.logo}
                    className="object-contain drop-shadow-sm"
                    priority
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent to-white/20 group-hover:opacity-100 opacity-0 transition-opacity duration-200"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-lg text-gray-900 group-hover:text-gray-700 transition-colors">
                    {process.env.NEXT_PUBLIC_NAME_APP || "ROBOTIPA EDU"}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Plataforma Educativa</p>
                </div>
              </Link>
            </div>

            {/* Navigation Breadcrumb - Centro */}
            <div className="hidden md:flex items-center gap-2">
              <nav className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border">
                <Link
                  href="/search"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    styles.isCustom 
                      ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                      : `text-gray-600 ${styles.className?.primaryTextHover} hover:bg-gray-100`
                  }`}
                >
                  <ArrowLeft size={14} />
                  <span>Cursos</span>
                </Link>
                
                <ChevronDown size={14} className="text-gray-400 rotate-[-90deg]" />
                
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  styles.isCustom 
                    ? "text-gray-900 bg-white shadow-sm" 
                    : `${styles.className?.primaryText} bg-white shadow-sm`
                }`}
                style={styles.isCustom ? { color: styles.primaryText } : undefined}
                >
                  <BookOpen size={14} />
                  <span>Capítulo</span>
                </div>
              </nav>
            </div>

            {/* User Section - Derecha */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* Header del Sheet */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <h2 className="font-semibold text-lg">Menú</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X size={20} />
                      </Button>
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="flex-1 p-4 space-y-4">
                      <Link
                        href="/search"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ArrowLeft size={20} />
                        <div>
                          <p className="font-medium">Volver a Cursos</p>
                          <p className="text-sm text-gray-500">Explorar más contenido</p>
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <BookOpen size={20} className={styles.isCustom ? "text-gray-700" : ""} 
                                 style={styles.isCustom ? { color: styles.primary } : undefined} />
                        <div>
                          <p className="font-medium">Capítulo Actual</p>
                          <p className="text-sm text-gray-500">Estás aquí</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* User Profile */}
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="hidden sm:block space-y-1">
                    <div className="w-24 h-3 bg-gray-200 animate-pulse rounded"></div>
                    <div className="w-32 h-2 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" 
                      className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                      <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                        <AvatarFallback 
                          className={`font-semibold text-sm ${
                            styles.isCustom ? "text-white" : `${styles.className?.primaryText} bg-gray-100`
                          }`}
                          style={styles.isCustom ? { backgroundColor: styles.primary, color: 'white' } : undefined}
                        >
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-900 max-w-32 truncate">
                          {getUserDisplayName()}
                        </span>
                        <span className="text-xs text-gray-500 max-w-32 truncate">
                          {user.email}
                        </span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 hidden lg:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-64 p-2 bg-white" sideOffset={8}>
                    {/* User Info Header */}
                    <DropdownMenuLabel className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback 
                            className={`font-semibold ${
                              styles.isCustom ? "text-white" : styles.className?.primaryText
                            }`}
                            style={styles.isCustom ? { backgroundColor: styles.primary } : undefined}
                          >
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Estudiante
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Menu Items */}
                    <DropdownMenuItem asChild className="p-0">
                      <Link href="/" className="flex items-center gap-3 w-full p-3 rounded-lg">
                        <Home size={18} className="text-gray-500" />
                        <div>
                          <p className="font-medium">Ir al inicio</p>
                          <p className="text-xs text-gray-500">Página principal</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="p-0">
                      <Link href="/profile" className="flex items-center gap-3 w-full p-3 rounded-lg">
                        <User size={18} className="text-gray-500" />
                        <div>
                          <p className="font-medium">Mi perfil</p>
                          <p className="text-xs text-gray-500">Configurar cuenta</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="p-0">
                      <Link href="/courses" className="flex items-center gap-3 w-full p-3 rounded-lg">
                        <GraduationCap size={18} className="text-gray-500" />
                        <div>
                          <p className="font-medium">Mis cursos</p>
                          <p className="text-xs text-gray-500">Ver progreso</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="p-0">
                      <Link href="/help" className="flex items-center gap-3 w-full p-3 rounded-lg">
                        <HelpCircle size={18} className="text-gray-500" />
                        <div>
                          <p className="font-medium">Ayuda</p>
                          <p className="text-xs text-gray-500">Soporte técnico</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-3 text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                    >
                      <LogOut size={18} />
                      <div>
                        <p className="font-medium">Cerrar sesión</p>
                        <p className="text-xs text-red-500/70">Salir de la cuenta</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button
                    className={`font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                      styles.isCustom ? "text-white" : styles.className?.primary
                    }`}
                    style={styles.isCustom ? { backgroundColor: styles.primary } : undefined}
                    onMouseEnter={(e) => {
                      if (styles.isCustom && styles.primaryHover) {
                        e.currentTarget.style.backgroundColor = styles.primaryHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (styles.isCustom && styles.primary) {
                        e.currentTarget.style.backgroundColor = styles.primary;
                      }
                    }}
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Gradient Separator */}
      <div 
        className="h-1 w-full"
        style={styles.isCustom ? {
          background: `linear-gradient(90deg, transparent, ${styles.primary}, transparent)`
        } : {
          background: `linear-gradient(90deg, transparent, rgb(var(--primary-600)), transparent)`
        }}
      />
    </>
  );
}