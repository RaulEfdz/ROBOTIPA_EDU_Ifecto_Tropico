// app/auth/reset-password/ResetPasswordClient.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

const ResetPasswordClient = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const supabase = createClient();

  useEffect(() => {
    const authenticateUser = async () => {
      if (!code) {
        setError("Código de restablecimiento inválido o ausente.");
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setError("Autenticación fallida: " + error.message);
      } else if (data.session) {
        setIsAuthenticated(true);
      }
    };

    authenticateUser();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isAuthenticated) {
      setError("Debes estar autenticado para restablecer la contraseña.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600">{error}</p>}
          {success ? (
            <p className="text-green-600">
              ¡Contraseña actualizada! Redirigiendo...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!isAuthenticated}>
                Restablecer
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordClient;
