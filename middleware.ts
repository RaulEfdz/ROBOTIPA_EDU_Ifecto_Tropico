// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./utils/supabase/server";

// Rutas protegidas (requieren sesión)
const protectedRoutes = [
  "/catalog",
  "/profile",
  // "/courses", // Asegúrate que la ruta base del curso esté aquí
  "/teacher",
  "/settings",
  "/admin",
  "/pages/course", // Si esta es la ruta donde se ven detalles y se puede comprar
  "/search", // Asumiendo que "Mis Cursos" o búsqueda de cursos requiere sesión
];

// Rutas públicas (no requieren sesión)
const publicRoutes = [
  "/",
  "/auth",
  "/auth/login", // Si tienes rutas específicas, aunque /auth puede ser suficiente
  "/auth/register",
  "/auth/confirm-action",
  "/auth/ResetPass",
  "/about",
  "/contact",
  "/faq",
  "/courses/catalog", // El catálogo debe ser público
  "/payments", // Página de pagos podría ser pública si el flujo lo requiere
  "/temrs", // Términos y condiciones
  // Si /pages/course/[courseId] debe ser parcialmente público (ver info) y
  // solo la compra/inscripción requiere login, se maneja en el botón de compra.
  // Por ahora, lo mantendremos como protegido si la acción de compra está allí.
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("[") && route.includes("]")) {
      const baseRoute = route.substring(0, route.indexOf("["));
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + "/"); // Para cubrir /auth y /auth/algo
  });

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.includes("[") && route.includes("]")) {
      const baseRoute = route.substring(0, route.indexOf("["));
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });

  // Si el usuario está en una ruta de autenticación y ya tiene sesión
  if (
    session &&
    pathname.startsWith("/auth") &&
    pathname !== "/auth/clearSiteData" &&
    pathname !== "/auth/confirm-action"
  ) {
    const redirectUrlAfterAuth =
      request.nextUrl.searchParams.get("redirectUrl");
    if (redirectUrlAfterAuth && redirectUrlAfterAuth.startsWith("/")) {
      return NextResponse.redirect(new URL(redirectUrlAfterAuth, request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si es una ruta pública y no es /auth (ya que /auth se maneja arriba si hay sesión), dejamos pasar
  if (isPublicRoute && !pathname.startsWith("/auth")) {
    return response;
  }

  // Si es una ruta protegida y NO hay sesión, redirigimos a /auth con redirectUrl
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirectUrl", pathname + request.nextUrl.search);

    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está intentando acceder a una ruta de autenticación (/auth, /auth/login, etc.) y NO tiene sesión, permitir
  if (pathname.startsWith("/auth") && !session) {
    return response;
  }

  // Para cualquier otra ruta no explícitamente pública o protegida:
  // Si no hay sesión, redirigir a /auth (podría ser un catch-all para rutas desconocidas)
  // Si hay sesión, permitir el acceso (asumiendo que si no está en protegida, y tiene sesión, está bien).
  // O podrías ser más estricto y redirigir a 404 si la ruta no está definida.
  // Por ahora, si llega aquí y tiene sesión, se asume que es una ruta válida no listada (ej. interna del dashboard).
  // Si no tiene sesión y no es pública, ya debería haber sido redirigido por el bloque `isProtectedRoute && !session`.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|api/auth/logout|api/paguelofacil/webhook).*)",
  ],
};
