// app/auth/SignUp/SignupForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Define la interfaz para las props del componente
interface SignupFormProps {
  redirectUrl: string;
}

export default function SignupForm({ redirectUrl }: SignupFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    toast.loading("Creando cuenta...");

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Supabase Auth permite 'user_metadata' o 'app_metadata'
          // Aquí asumimos que 'full_name' se mapea a user_metadata.full_name
        },
        emailRedirectTo: `${
          window.location.origin
        }/auth/confirm-action?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    setIsLoading(false);
    toast.dismiss();

    if (error) {
      toast.error(error.message || "Error al crear la cuenta.");
    } else if (
      signUpData.user &&
      signUpData.user.identities &&
      signUpData.user.identities.length === 0
    ) {
      toast.info(
        "Parece que ya tienes una cuenta con este correo. Intenta iniciar sesión o revisa tu bandeja de entrada para un correo de confirmación si no lo has hecho.",
        { duration: 8000 }
      );
    } else if (signUpData.session) {
      // Esto sucede si la confirmación por correo está deshabilitada
      toast.success("¡Cuenta creada e iniciada sesión!");
      try {
        await fetch("/api/auth/insertUser", { method: "POST" });
      } catch (syncError) {
        console.error("Error sincronizando usuario con DB local:", syncError);
        toast.warning("No se pudo sincronizar completamente la sesión.", {
          duration: 5000,
        });
      }

      router.push(redirectUrl);
      setTimeout(() => router.refresh(), 100);
    } else {
      // Comportamiento estándar: email de confirmación enviado
      toast.success(
        "¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta y completar el registro.",
        { duration: 8000 }
      );
      // Opcional: redirigir a una página informativa
      // router.push("/auth/check-email"); // Crea esta página si quieres
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName-signup">Nombre Completo</Label>
        <Input
          id="fullName-signup"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Juan Pérez"
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-signup">Correo Electrónico</Label>
        <Input
          id="email-signup"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">Contraseña</Label>
        <Input
          id="password-signup"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="•••••••• (mínimo 6 caracteres)"
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creando..." : "Crear Cuenta"}
      </Button>
    </form>
  );
}
