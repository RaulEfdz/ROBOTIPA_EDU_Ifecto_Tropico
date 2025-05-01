// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./utils/supabase/server";

// Rutas protegidas (requieren sesión)
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/courses", // Ej: gestionar cursos
  "/teacher", // Ej: panel de profesores
  "/settings", // Ej: configuración de cuenta
  "/admin", // Ej: área administrativa
];

// Rutas públicas (no requieren sesión)
const publicRoutes = [
  "/",
  "/auth",
  "/auth/login",
  "/auth/register",
  "/about",
  "/contact",
  "/faq",
  "/pages",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si es una ruta pública, dejamos pasar siempre
  if (isPublicRoute) {
    return response;
  }

  // Si es ruta protegida y no hay sesión, redirigimos a login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Si no es ni pública ni protegida, también dejamos pasar (ej: páginas 404, 500, etc.)
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // Solo interceptamos rutas reales
  ],
};
