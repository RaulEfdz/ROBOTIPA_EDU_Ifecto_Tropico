"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TestSession() {
  const supabase = createClient();

  // Hardcoded test credentials - replace with valid test user credentials
  const testEmail = "raulefdz@gmail.com";
  const testPassword = "/;";

  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

  const testLogin = async () => {
    setMessage("Intentando iniciar sesión...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      setSessionActive(false);
      setMessage(`Error al iniciar sesión: ${error.message}`);
      return;
    }

    if (data?.session) {
      setSessionActive(true);
      setMessage("Inicio de sesión exitoso. Sesión activa.");

      // Log cookies after login for debugging
      const cookies = document.cookie;
      console.log("Cookies después de login:", cookies);
      setMessage((msg) => msg + "\nCookies después de login: " + cookies);
    } else {
      setSessionActive(false);
      setMessage("Inicio de sesión sin sesión activa.");
    }
  };

  const checkSession = () => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data.session) {
        setSessionActive(true);
        setMessage("Sesión actualmente activa.");
      } else {
        setSessionActive(false);
        setMessage("No hay sesión activa.");
      }
    });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Test de Sesión de Usuario</h2>
      <p>
        Credenciales de prueba: {testEmail} / {testPassword}
      </p>
      <button onClick={testLogin} style={{ marginRight: "1rem" }}>
        Iniciar Sesión con Credenciales de Prueba
      </button>
      <button onClick={checkSession}>Verificar Sesión Actual</button>
      <p>
        Estado de sesión:{" "}
        {sessionActive === null
          ? "No probado"
          : sessionActive
            ? "Activa"
            : "Inactiva"}
      </p>
      <p>{message}</p>
    </div>
  );
}
