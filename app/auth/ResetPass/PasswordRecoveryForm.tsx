"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export const PasswordRecoveryForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const supabase = createClient();

  const validateEmail = (email: string): boolean => {
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (email) {
      setIsEmailValid(validateEmail(email));
    } else {
      setIsEmailValid(null);
    }
  }, [email]);

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: passwordRecoveryError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (passwordRecoveryError) {
        if (passwordRecoveryError.message === "User not found") {
          setError("No pudimos encontrar una cuenta asociada a este correo electrónico. Por favor, verifica que el correo electrónico esté correctamente escrito.");
        } else {
          throw passwordRecoveryError;
        }
      } else {
        setSuccessMessage("Si existe una cuenta asociada a este correo, te enviaremos un email con instrucciones para restablecer tu contraseña.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al solicitar la recuperación de contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="space-y-2">
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardTitle>¿Olvidaste tu contraseña? No te preocupes.</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordRecovery} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              className={isEmailValid === false ? "border-destructive" : undefined}
            />
            {isEmailValid === false && (
              <p className="text-sm text-destructive">Por favor, introduce un correo electrónico válido.</p>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default">
              <Mail className="h-4 w-4" />
              <AlertTitle className="font-bold">¡Instrucciones!</AlertTitle>
              <AlertDescription>
                {successMessage}
                <p className="text-sm mt-2">
                    Si no tienes una cuenta, te recomendamos crear una.</p> 
              </AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || isEmailValid === false}>
            {isLoading ? "Enviando Correo..." : "Recuperar Contraseña"}
          </Button>
          {isEmailValid === true && email && !isLoading && (
            <div className="flex items-center space-x-2 text-green-500 text-sm mt-2">
              <CheckCircle className="h-4 w-4" />
              <span>Correo electrónico válido.</span>
            </div>
          )}
        </form>
      </CardContent>
    </>
  );
};