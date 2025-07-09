import "./globals.css";
import "./theme.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import FloatingHelpButton from "@/components/FloatingHelpButton";
import { printDebug, printInitDebug } from "@/utils/debug/log";
import { getPrimaryColor } from "@/utils/primaryColor";

export const metadata: Metadata = {
  title: `Cursos de ${process.env.NEXT_PUBLIC_NAME_APP || "Robotipa Academy"}`,
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
  // Obtener el color primario desde la función utilitaria
  const primaryColor = getPrimaryColor();
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Se movieron los links de fuentes a _document.tsx */}
        <script
          src="https://secure.paguelofacil.com/HostedFields/vendor/scripts/WALLET/PFScript.js"
          defer
        ></script>
      </head>
      <body style={{ "--primary": primaryColor } as React.CSSProperties}>
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
