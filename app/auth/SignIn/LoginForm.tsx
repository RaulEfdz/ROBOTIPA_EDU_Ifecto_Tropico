// app/auth/SignIn/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  redirectUrl: string;
  setIsPasswordRecovery?: (value: boolean) => void;
}

export default function LoginForm({
  redirectUrl,
  setIsPasswordRecovery,
}: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const cookies = {
    getAll() {
      // Parse document.cookie string into array of cookie objects
      return document.cookie
        .split("; ")
        .filter(Boolean)
        .map((cookieStr) => {
          const [name, ...rest] = cookieStr.split("=");
          const value = rest.join("=");
          return { name, value };
        });
    },
    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}; path=/`;
          if (options) {
            if (options.secure) cookieString += "; Secure";
            if (options.sameSite)
              cookieString += `; SameSite=${options.sameSite}`;
            if (options.expires) {
              const expires =
                options.expires instanceof Date
                  ? options.expires.toUTCString()
                  : options.expires;
              cookieString += `; Expires=${expires}`;
            }
          }
          document.cookie = cookieString;
        });
      } catch {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading("Iniciando sesión...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setIsLoading(false);
    toast.dismiss(loadingToastId);

    if (error) {
      const msg =
        error.message || "Ocurrió un problema inesperado. Inténtalo de nuevo.";
      if (error.message === "Invalid login credentials") {
        toast.error("Credenciales inválidas", {
          description: "El correo o la contraseña son incorrectos.",
        });
      } else if (msg.toLowerCase().includes("email not confirmed")) {
        toast.warning("Correo no confirmado", {
          description: "Revisa tu bandeja de entrada para confirmar tu correo.",
          duration: 6000,
        });
      } else {
        toast.error("Error al iniciar sesión", { description: msg });
      }
      return;
    }

    if (data?.session) {
      // Set cookies to maintain session
      cookies.setAll([
        {
          name: "sb-access-token",
          value: data.session.access_token,
          options: { path: "/", secure: true, sameSite: "lax" },
        },
        {
          name: "sb-refresh-token",
          value: data.session.refresh_token,
          options: { path: "/", secure: true, sameSite: "lax" },
        },
      ]);
    }

    toast.success("¡Inicio de sesión exitoso!");

    // Sincronizar sesión con DB local
    fetch("/api/auth/insertUser", { method: "POST" }).catch((syncErr) => {
      console.error("Sync error:", syncErr);
      toast.warning("No se pudo sincronizar la sesión completamente.", {
        duration: 5000,
      });
    });

    router.push(redirectUrl);
    setTimeout(() => router.refresh(), 100);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Correo Electrónico
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          autoComplete="email"
          className="h-10 px-3 dark:bg-slate-700 dark:border-slate-600"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="h-10 px-3 pr-10 dark:bg-slate-700 dark:border-slate-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute inset-y-0 right-2 flex items-center justify-center p-1"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-slate-500" />
            ) : (
              <Eye className="h-5 w-5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-10 font-semibold bg-emerald-900 hover:bg-emerald-950 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Ingresando...
          </span>
        ) : (
          "Ingresar"
        )}
      </Button>

      {setIsPasswordRecovery && (
        <div className="text-center text-sm pt-2">
          <button
            type="button"
            onClick={() => setIsPasswordRecovery(true)}
            className="font-medium text-primaryCustom hover:underline dark:text-emerald-400"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
    </form>
  );
}
