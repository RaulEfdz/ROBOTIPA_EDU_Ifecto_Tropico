import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { parseSessionCookie } from "./lib/parseSessionCookie"; // Ajusta la ruta si es necesario

// Helper para decodificar cookie base64 manualmente
function decodeBase64SessionCookie(request: NextRequest) {
  // El nombre de la cookie puede variar según tu configuración Supabase
  const sessionCookieName = "sb-access-token"; // O el nombre que uses
  const cookieValue = request.cookies.get(sessionCookieName)?.value;
  console.log(`Found cookie '${sessionCookieName}':`, cookieValue); // Log cookie value

  if (cookieValue && cookieValue.startsWith("base64-")) {
    console.log("Decoding base64 cookie...");
    const parsed = parseSessionCookie(cookieValue);
    console.log("Parsed cookie:", parsed);
    if (parsed && parsed.access_token) {
      // Sobrescribe la cookie en el request con el valor decodificado (solo para el helper)
      request.cookies.set(sessionCookieName, parsed.access_token);
      console.log("Overwrote cookie with decoded access token.");
    }
  }
}


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
  console.log("--- Middleware Start ---");
  console.log("Request URL:", request.nextUrl.pathname);
  console.log("All Cookies:", request.cookies.getAll());
  // Decodifica la cookie base64 antes de crear el cliente de Supabase
  decodeBase64SessionCookie(request);
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Supabase session in middleware:", session);

  const isPublicRoute = publicRoutes.some((route) => {
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
