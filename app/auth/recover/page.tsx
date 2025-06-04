"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function RecoverPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function getSessionFromUrl() {
      try {
        // Buscar tokens en el fragmento (#...) de la URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            setErrorMsg("Error al restaurar la sesión.");
            setSession(null);
          } else {
            setSession({ access_token, refresh_token });
          }
        } else {
          setErrorMsg("No se encontraron tokens de recuperación en la URL.");
          setSession(null);
        }
      } catch (err) {
        setErrorMsg("Error inesperado al procesar la URL.");
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    getSessionFromUrl();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMsg("Error al actualizar la contraseña: " + error.message);
    } else {
      router.push("/login");
    }
  };

  if (loading) {
    return <p>Verificando enlace de recuperación…</p>;
  }

  if (!session) {
    return <p>El enlace de recuperación no es válido o ya expiró.</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
      <h1>Restablecer contraseña</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="password">Nueva contraseña:</label>
        <input
          id="password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "0.5rem",
            marginTop: "0.5rem",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
}
