import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for Middleware context.
 * Requires NextRequest and NextResponse to handle cookies.
 */
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });
}

/**
 * Create a Supabase client for Server Components or Route Handlers.
 * Uses next/headers cookies() API.
 */
export function createServerComponentClient() {
  const cookieStore = nextCookies();
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // No-op: setting cookies not supported in Server Components
      },
      remove(name: string, options: CookieOptions) {
        // No-op: removing cookies not supported in Server Components
      },
    },
  });
}

/**
 * Generic createServerClient function that detects context.
 * If request and response are provided, uses middleware client.
 * Otherwise, uses server component client.
 */
export function createServerClient(
  request?: NextRequest,
  response?: NextResponse
) {
  if (request && response) {
    return createMiddlewareClient(request, response);
  }
  return createServerComponentClient();
}
