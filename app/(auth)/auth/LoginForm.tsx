"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface LoginFormProps {
  onAuthStateChange?: () => void;
  email: string;
  setEmail: (email: string) => void;
  setIsPasswordRecovery: (isPasswordRecovery: boolean) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onAuthStateChange,
  email,
  setEmail,
  setIsPasswordRecovery,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          setError("Correo electrónico o contraseña incorrectos.");
        } else if (signInError.message === "Email not confirmed") {
          setError("Por favor, confirma tu correo electrónico antes de iniciar sesión.");
        } else {
          setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.");
        }
      } else {
        if (onAuthStateChange) onAuthStateChange();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = () => {
    setIsPasswordRecovery(true);
  };

  return (
    <>
      <CardHeader className="space-y-2">
        <CardTitle>Iniciar Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-center w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full shadow-none"
            onClick={handlePasswordRecovery}
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
      </CardFooter>
    </>
  );
};
