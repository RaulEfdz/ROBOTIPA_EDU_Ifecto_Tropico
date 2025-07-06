import "./globals.css";
import "./theme.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import FloatingHelpButton from "@/components/FloatingHelpButton";
import { printDebug, printInitDebug } from "@/utils/debug/log";

export const metadata: Metadata = {
  title: `Cursos de ${process.env.NEXT_PUBLIC_NAME_APP || 'Robotipa Academy'}`,
  description:
    "Grupo multidisciplinario comprometido con el avance científico, la generación de conocimiento y el bienestar de las comunidades afectadas por enfermedades infecciosas tropicales y desatendidas, a través de un enfoque integral ofreciendo soluciones que impacten positivamente en la salud global, siguiendo un enfoque de 0ne Health",
};

const metaDataPage = {
  title: "layout",
  route: "app/(dashboard)/layout.tsx",
};
printInitDebug(metaDataPage.route);

// NOMBRE DE LA VARIABLE DE ENTORNO: NEXT_PUBLIC_PRIMARY_COLOR
// Ejemplo de uso en .env:
// NEXT_PUBLIC_PRIMARY_COLOR=blue
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://secure.paguelofacil.com/HostedFields/vendor/scripts/WALLET/PFScript.js"
          defer
        ></script>
      </head>
      <body style={{ '--primary': (process.env.NEXT_PUBLIC_PRIMARY_COLOR === 'blue' ? '#3b82f6' : process.env.NEXT_PUBLIC_PRIMARY_COLOR === 'rose' ? '#f43f5e' : process.env.NEXT_PUBLIC_PRIMARY_COLOR === 'indigo' ? '#6366f1' : process.env.NEXT_PUBLIC_PRIMARY_COLOR === 'amber' ? '#f59e42' : '#10b981') } as React.CSSProperties}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConfettiProvider />
          <ToastProvider />
          {children}
          <FloatingHelpButton />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
