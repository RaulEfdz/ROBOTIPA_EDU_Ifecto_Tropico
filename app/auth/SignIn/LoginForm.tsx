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
import { Eye, EyeOff } from "lucide-react"; // Importar iconos para mostrar/ocultar contraseña

// Definir la interfaz para las props del componente
interface LoginFormProps {
  redirectUrl: string;
  // Opcional: Si necesitas pasar setIsPasswordRecovery desde el padre
  setIsPasswordRecovery?: (value: boolean) => void;
}

export default function LoginForm({
  redirectUrl,
  setIsPasswordRecovery,
}: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();
  // Estado local para email y contraseña
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    toast.loading("Iniciando sesión...");

    // Quitar espacios extra del email, pero NO de la contraseña
    const emailToSubmit = email.trim();
    const passwordToSubmit = password;

    if (!emailToSubmit || !passwordToSubmit) {
      toast.error("Por favor, ingresa tu correo y contraseña.");
      setIsLoading(false);
      toast.dismiss(); // Quitar el loading toast
      return;
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email: emailToSubmit,
      password: passwordToSubmit,
    });

    setIsLoading(false);
    toast.dismiss();

    if (error) {
      // Manejo más específico de errores comunes
      if (error.message === "Invalid login credentials") {
        toast.error("Credenciales Inválidas", {
          description: "El correo electrónico o la contraseña son incorrectos.",
        });
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.warning("Correo no confirmado", {
          description:
            "Revisa tu bandeja de entrada para confirmar tu correo antes de iniciar sesión.",
          duration: 6000,
        });
      } else {
        toast.error("Error al iniciar sesión", {
          description:
            error.message ||
            "Ocurrió un problema inesperado. Inténtalo de nuevo.",
        });
      }
    } else {
      toast.success("¡Inicio de sesión exitoso!");
      // Sincronizar con la base de datos local después del login
      try {
        await fetch("/api/auth/insertUser", { method: "POST" });
      } catch (syncError) {
        console.error("Error sincronizando usuario con DB local:", syncError);
        toast.warning("No se pudo sincronizar completamente la sesión.", {
          duration: 5000,
        });
      }

      router.push(redirectUrl);
      setTimeout(() => router.refresh(), 100); // Refrescar para actualizar estado del servidor
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-5">
      {" "}
      {/* Ajustado space-y */}
      <div className="space-y-1.5">
        {" "}
        {/* Ajustado space-y */}
        <Label
          htmlFor="email-login"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Correo Electrónico
        </Label>
        <Input
          id="email-login"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
          autoComplete="email"
          className="h-10 sm:h-11 px-3 dark:bg-slate-700 dark:border-slate-600" // Ajustada altura y estilos dark
        />
      </div>
      <div className="space-y-1.5">
        {" "}
        {/* Ajustado space-y */}
        <Label
          htmlFor="password-login"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password-login"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-10 sm:h-11 px-3 pr-10 dark:bg-slate-700 dark:border-slate-600" // Ajustada altura, padding y estilos dark
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" // Ajustado tamaño y posición
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full h-10 sm:h-11 font-semibold bg-primaryCustom2 hover:bg-primaryCustom2/90 text-white dark:bg-sky-500 dark:hover:bg-sky-600" // Estilos aplicados
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Ingresando...
          </div>
        ) : (
          "Ingresar"
        )}
      </Button>
      {/* Mostrar enlace de recuperación si la función setIsPasswordRecovery fue pasada */}
      {setIsPasswordRecovery && (
        <div className="text-center text-sm pt-2">
          <button
            type="button" // Importante que sea type="button" para no enviar el form
            onClick={() => setIsPasswordRecovery(true)}
            className="font-medium text-primaryCustom hover:underline dark:text-sky-400 dark:hover:text-sky-300"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
    </form>
  );
}
