import { createBrowserClient } from "@supabase/ssr";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function createClient() {
  const access_token = getCookie("sb-access-token");
  const refresh_token = getCookie("sb-refresh-token");

  const session =
    access_token && refresh_token
      ? {
          access_token,
          refresh_token,
          token_type: "bearer",
          expires_in: 3600, // optional, can be adjusted
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        }
      : null;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (session) {
    supabase.auth.setSession(session).catch(() => {
      // ignore errors
    });
  }

  return supabase;
}
