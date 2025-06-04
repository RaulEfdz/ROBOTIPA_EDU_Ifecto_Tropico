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

// import { createBrowserClient } from "@supabase/ssr";

// const getURL = () => {
//   let url =
//     process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
//     process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
//     "http://localhost:3000/";
//   // Make sure to include `https://` when not localhost.
//   url = url.startsWith("http") ? url : `https://${url}`;
//   // Make sure to include a trailing `/`.
//   url = url.endsWith("/") ? url : `${url}/`;
//   return url;
// };

// export function createClient() {
//   const supabase = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       // Pass the current URL to let Supabase parse the tokens from the URL automatically
//       auth: {
//         detectSessionInUrl: true,
//         // redirectTo is not a valid option here, remove it
//       },
//     }
//   );

//   return supabase;
// }
