import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Pass the current URL to let Supabase parse the tokens from the URL automatically
      auth: {
        detectSessionInUrl: true,
        // The URL with tokens is window.location.href in the browser
        // This option is supported by @supabase/ssr createBrowserClient
        // If not, we can pass the URL as a parameter or handle manually
        // But detectSessionInUrl: true should be enough
      },
    }
  );

  return supabase;
}
