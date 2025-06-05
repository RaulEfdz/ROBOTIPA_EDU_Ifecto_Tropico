import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Rutas protegidas (requieren sesión)
const protectedRoutes = [
  "/catalog",
  "/profile",
  "/teacher",
  "/settings",
  "/admin",
  "/search",
  "/",
];

// Rutas públicas (no requieren sesión)
const publicRoutes = [
  "/auth",
  "/auth/login",
  "/auth/register",
  "/auth/confirm-action",
  "/auth/ResetPass",
  "/account/update-password",
  "/auth/ResetPass/reset-password",
  "/about",
  "/contact",
  "/faq",
  "/courses/catalog",
  "/courses/course/[courseId]",
  "/payments",
  "/temrs",
  "/pages/course",
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("[") && route.includes("]")) {
      const baseRoute = route.substring(0, route.indexOf("["));
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.includes("[") && route.includes("]")) {
      const baseRoute = route.substring(0, route.indexOf("["));
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });

  // Usuario ya autenticado intenta acceder a /auth
  if (
    session &&
    pathname.startsWith("/auth") &&
    pathname !== "/auth/clearSiteData" &&
    pathname !== "/auth/confirm-action" &&
    pathname !== "/auth/ResetPass/reset-password"
  ) {
    const redirectUrlAfterAuth =
      request.nextUrl.searchParams.get("redirectUrl");
    if (redirectUrlAfterAuth && redirectUrlAfterAuth.startsWith("/")) {
      return NextResponse.redirect(new URL(redirectUrlAfterAuth, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Ruta pública y no es parte del sistema de auth → permitir
  if (isPublicRoute && !pathname.startsWith("/auth")) {
    return response;
  }

  // Ruta protegida y usuario no autenticado → redirigir a login
  // if (isProtectedRoute && !session) {
  //   const loginUrl = new URL("/auth", request.url);
  //   loginUrl.searchParams.set("redirectUrl", pathname + search);
  //   return NextResponse.redirect(loginUrl);
  // }

  // Rutas de /auth → permitir si no hay sesión
  if (pathname.startsWith("/auth") && !session) {
    return response;
  }

  // Ruta desconocida, permitir si hay sesión
  return response;
}

// Configura las rutas que interceptará el middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|api/auth/logout|api/paguelofacil/webhook).*)",
  ],
};
