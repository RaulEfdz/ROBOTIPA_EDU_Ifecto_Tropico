import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { ToastProvider } from '@/components/providers/toaster-provider'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { printDebug, printInitDebug } from '@/utils/debug/log'

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'rbtpMed-UP',
  description: 'Programa de formación en metodología de la investigación y habilidades blandas de la facultad de medicina de la Universidad de Panamá 🇵🇦',
}

const metaDataPage = {
  title: "layout",
  route: "app/(dashboard)/layout.tsx",
};
printInitDebug(metaDataPage.route)


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={roboto.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
            <ConfettiProvider />
            <ToastProvider />
            {children}
            <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}