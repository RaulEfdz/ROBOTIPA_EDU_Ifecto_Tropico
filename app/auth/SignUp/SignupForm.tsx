"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";

import { countries } from "../../data/countries";

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

function useOutsideAlerter(
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

// Define la interfaz para las props del componente
interface SignupFormProps {
  redirectUrl: string;
}

export default function SignupForm({ redirectUrl }: SignupFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pais, setPais] = useState("");
  const [profesion, setProfesion] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(filter.toLowerCase())
  );

  useOutsideAlerter(dropdownRef, () => setIsOpen(false));

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
          pais,
          profesion,
          institucion,
          telefono,
          // Aquí asumimos que 'full_name' se mapea a user_metadata.full_name
        } as any,
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

      // Set cookies to maintain session
      cookies.setAll([
        {
          name: "sb-access-token",
          value: signUpData.session.access_token,
          options: { path: "/", secure: true, sameSite: "lax" },
        },
        {
          name: "sb-refresh-token",
          value: signUpData.session.refresh_token,
          options: { path: "/", secure: true, sameSite: "lax" },
        },
      ]);

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
      // Redirigir a la página de espera de confirmación de correo
      router.push("/auth/check-email");
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFullName(e.target.value)
          }
          required
          placeholder="Juan Pérez"
          autoComplete="name"
        />
      </div>
      <div className="space-y-2 relative" ref={dropdownRef}>
        <Label htmlFor="pais-signup">País</Label>
        <div className="flex items-center space-x-2">
          {pais && (
            <span className="text-2xl select-none">
              {countries.find((c) => c.name === pais)?.flag}
            </span>
          )}
          <input
            id="pais-signup"
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Seleccione un país"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="country-listbox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
            required
          />
        </div>
        {isOpen && (
          <ul
            id="country-listbox"
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={pais === country.name}
                  className={`relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    pais === country.name
                      ? "bg-primary-600 text-white"
                      : "text-gray-900"
                  }`}
                  onClick={() => {
                    setPais(country.name);
                    if (!telefono.startsWith(country.phone)) {
                      setTelefono(country.phone + " ");
                    }
                    setFilter(country.name);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate">
                    {country.flag} {country.name}
                  </span>
                </li>
              ))
            ) : (
              <li className="relative cursor-default select-none py-2 px-3 text-gray-700">
                No se encontraron países
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="profesion-signup">Profesión</Label>
        <select
          id="profesion-signup"
          value={profesion}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setProfesion(e.target.value)
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          autoComplete="organization-title"
        >
          <option value="">Seleccione una opción</option>
          <option value="Estudiante">Estudiante</option>
          <option value="Particular">Particular</option>
          <option value="Profesional">Profesional</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="institucion-signup">
          {profesion === "Estudiante"
            ? "Institución/Universidad"
            : profesion === "Particular"
              ? "Empresa/Organización"
              : profesion === "Profesional"
                ? "Institución/Empresa"
                : "Institución/Universidad"}
        </Label>
        <Input
          id="institucion-signup"
          type="text"
          value={institucion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInstitucion(e.target.value)
          }
          placeholder={
            profesion === "Estudiante"
              ? "Universidad de Panamá"
              : profesion === "Particular"
                ? "Empresa XYZ"
                : profesion === "Profesional"
                  ? "Institución ABC"
                  : "Institución/Universidad"
          }
          autoComplete="organization"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefono-signup">Teléfono</Label>
        <Input
          id="telefono-signup"
          type="tel"
          value={telefono}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTelefono(e.target.value)
          }
          placeholder="+507 1234 5678"
          autoComplete="tel"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-signup">
          Correo Electrónico <span className="text-red-600">*</span>
        </Label>
        <Input
          id="email-signup"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
          placeholder="correo@ejemplo.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">
          Contraseña <span className="text-red-600">*</span>
        </Label>
        <Input
          id="password-signup"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
          placeholder="********"
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword-signup">
          Confirmar Contraseña <span className="text-red-600">*</span>
        </Label>
        <Input
          id="confirmPassword-signup"
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          required
          placeholder="********"
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creando cuenta..." : "Registrarse"}
      </Button>
    </form>
  );
}
