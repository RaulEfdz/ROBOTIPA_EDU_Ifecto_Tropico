"use client";

import React, { useState } from "react";
import { createClient } from "../../../utils/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Simple email format validation regex
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un email válido.");
      return;
    }

    setLoading(true);

    // Call Supabase to send reset password email with redirectTo option
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      // Handle specific error messages
      if (error.message.includes("User not found")) {
        setError("Email no registrado.");
      } else if (error.message.includes("network")) {
        setError("Error de red. Intenta nuevamente.");
      } else {
        setError(error.message);
      }
    } else {
      setMessage("Revisa tu correo para restablecer la contraseña.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Olvidé mi contraseña</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email" className="block mb-2 font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="tuemail@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace de restablecimiento"}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
