"use client";
import { Suspense, useState } from "react";
import ResetPasswordClient from "./reset-password/page";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPassPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setIsLoading(false);
    if (error) {
      toast.error("Error al enviar el correo de recuperación", {
        description: error.message,
      });
    } else {
      setSuccess(true);
      toast.success(
        "Correo de recuperación enviado. Revisa tu bandeja de entrada."
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <p className="text-green-600">
              Correo enviado. Revisa tu bandeja de entrada.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar correo de recuperación"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
