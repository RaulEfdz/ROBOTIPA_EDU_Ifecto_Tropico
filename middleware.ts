// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './utils/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const esRutaAuth = pathname.startsWith('/auth');

  // Protege /dashboard, /courses, y /profile
  const rutasProtegidas = ['/','/dashboard', '/courses', '/profile'];

  const esRutaProtegida = rutasProtegidas.some((ruta) =>
    pathname.startsWith(ruta)
  );

  if (esRutaProtegida && !session && !esRutaAuth) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
