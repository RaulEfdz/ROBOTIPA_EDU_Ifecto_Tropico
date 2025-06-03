"use client";

import React, { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Simple email format validation regex
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un email válido.");
      toast.error("Por favor, ingresa un email válido.");
      return;
    }

    if (cooldown > 0) {
      toast.error(`Por favor espera ${cooldown} segundos antes de reenviar.`);
      return;
    }

    setLoading(true);

    // Call Supabase to send reset password email with redirectTo option
    const redirectUrl =
      process.env.STATUS_DEVELOPMENT === "true"
        ? "http://localhost:3000/auth/recover"
        : `${window.location.origin}/auth/recover`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      // Handle specific error messages
      if (error.message.includes("User not found")) {
        setError("Email no registrado.");
        toast.error("Email no registrado.");
      } else if (error.message.includes("network")) {
        setError("Error de red. Intenta nuevamente.");
        toast.error("Error de red. Intenta nuevamente.");
      } else if (error.message.toLowerCase().includes("rate limit")) {
        setError("Se ha excedido el límite de correos. Intenta más tarde.");
        toast.error("Se ha excedido el límite de correos. Intenta más tarde.");
      } else {
        setError(error.message);
        toast.error(error.message);
      }
    } else {
      setMessage("Revisa tu correo para restablecer la contraseña.");
      toast.success("Revisa tu correo para restablecer la contraseña.");
      setCooldown(60);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 sm:p-12">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="p-8 text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
            Olvidé mi contraseña
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
            Ingresa tu correo electrónico para recibir un enlace de
            restablecimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tuemail@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full"
            >
              {loading
                ? "Enviando..."
                : cooldown > 0
                  ? `Espera ${cooldown}s`
                  : "Enviar enlace de restablecimiento"}
            </Button>
          </form>
          {message && <p className="mt-4 text-green-600">{message}</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
