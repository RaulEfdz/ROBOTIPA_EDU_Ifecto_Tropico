// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './utils/supabase/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient();

  // Recuperar la sesión de Supabase
  const { data: { session } } = await supabase.auth.getSession();

  console.log("medd session: ", session)

  // Definir rutas protegidas
  const rutasProtegidas = ['/modules'];
  const esRutaProtegida = rutasProtegidas.some((ruta) =>
    request.nextUrl.pathname.startsWith(ruta)
  );

  // Redirigir al usuario a la página de inicio de sesión si no está autenticado
  if (esRutaProtegida && !session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return response;
}

// Configurar las rutas que utilizarán este middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};