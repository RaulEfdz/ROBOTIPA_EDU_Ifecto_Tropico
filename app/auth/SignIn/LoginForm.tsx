"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import ClearCacheButton from "../clearSiteData";

interface LoginFormProps {
  onAuthStateChange?: () => void;
  email: string;
  setEmail: (email: string) => void;
  setIsPasswordRecovery: (isPasswordRecovery: boolean) => void;
  config: {
    emailPlaceholder: string;
    passwordPlaceholder: string;
    loginButtonText: string;
    forgotPasswordLinkText: string;
  };
  styles: {
    backgrounds: {
      panel: string;
    };
    texts: {
      primary: string;
      secondary: string;
      link: string;
    };
    buttons: {
      primary: string;
      primaryText: string;
    };
  };
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onAuthStateChange,
  email,
  setEmail,
  setIsPasswordRecovery,
  config,
  styles,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        toast.error("Campos requeridos", {
          description: "Por favor ingresa tu correo y contraseña.",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Acceso denegado", {
            description: "Correo electrónico o contraseña incorrectos.",
          });
        } else if (error.message === "Email not confirmed") {
          toast.warning("Correo no confirmado", {
            description: "Confirma tu correo antes de iniciar sesión.",
          });
        } else {
          toast.error("Error al iniciar sesión", {
            description: "Inténtalo nuevamente.",
          });
        }
      } else {
        toast.success("Bienvenido", {
          description: "Has iniciado sesión correctamente.",
        });
        if (onAuthStateChange) onAuthStateChange();
      }
    } catch (err) {
      toast.error("Error inesperado", {
        description:
          err instanceof Error
            ? err.message
            : "Algo salió mal. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg border-0"
      style={{ backgroundColor: styles.backgrounds.panel }}
    >
      <CardHeader className="space-y-1 pb-4">
        <CardTitle
          className="text-2xl font-bold text-center"
          style={{ color: styles.texts.primary }}
        >
          Iniciar sesión
        </CardTitle>
        <p
          className="text-sm text-center"
          style={{ color: styles.texts.secondary }}
        >
          Ingresa tus credenciales para acceder
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              placeholder={config.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-3"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={config.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-3 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
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
            className="w-full h-11 font-semibold"
            disabled={isLoading}
            style={{
              backgroundColor: styles.buttons.primary,
              color: styles.buttons.primaryText,
            }}
          >
            {isLoading ? "Iniciando sesión..." : config.loginButtonText}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-0">
        <div className="flex items-center justify-center w-full">
          <Button
            type="button"
            variant="ghost"
            className="text-sm underline underline-offset-4 font-medium"
            onClick={() => setIsPasswordRecovery(true)}
            disabled={isLoading}
            style={{ color: styles.texts.link }}
          >
            {config.forgotPasswordLinkText}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
