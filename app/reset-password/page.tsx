"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Password validation: minimum 8 chars, at least one uppercase, one number
  const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  // On mount, parse URL hash to get tokens and restore session
  useEffect(() => {
    async function restoreSession() {
      setLoadingSession(true);
      try {
        // Parse URL hash fragment for access_token and refresh_token
        const hash = window.location.hash.substring(1); // remove '#'
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (!access_token || !refresh_token) {
          setError("No se encontró sesión válida en la URL.");
          setLoadingSession(false);
          return;
        }

        setAccessToken(access_token);
        setRefreshToken(refresh_token);

        const { error: setSessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (setSessionError) {
          setError("Error al restaurar la sesión.");
        }
      } catch (err) {
        setError("Error inesperado al procesar la sesión.");
      } finally {
        setLoadingSession(false);
      }
    }

    restoreSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validatePassword(newPassword)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!accessToken || !refreshToken) {
      setError("No hay sesión activa para actualizar la contraseña.");
      return;
    }

    setUpdating(true);

    // Update user password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setUpdating(false);

    if (error) {
      setError("Error al actualizar la contraseña: " + error.message);
    } else {
      setMessage("Contraseña restablecida correctamente.");

      // Clear session and redirect to login after short delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/auth/page"); // Assuming login page is /auth/page
      }, 2000);
    }
  };

  if (loadingSession) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow text-center">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (error && !accessToken) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="newPassword" className="block mb-2 font-semibold">
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {updating ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
