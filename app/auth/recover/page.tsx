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
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get("token");
        const type = queryParams.get("type");
        const redirectTo = queryParams.get("redirect_to");
        const errorParam = queryParams.get("error");
        const errorCode = queryParams.get("error_code");
        const errorDescription = queryParams.get("error_description");

          "%c[RecoverPage] URL Search Params:",
          "color: blue; font-weight: bold;",
          window.location.search
        );
          "%c[RecoverPage] Token param:",
          "color: green; font-weight: bold;",
          token
        );
          "%c[RecoverPage] Type param:",
          "color: purple; font-weight: bold;",
          type
        );
          "%c[RecoverPage] Redirect_to param:",
          "color: orange; font-weight: bold;",
          redirectTo
        );
          "%c[RecoverPage] Error param:",
          "color: red; font-weight: bold;",
          errorParam
        );
          "%c[RecoverPage] Error code param:",
          "color: red; font-weight: bold;",
          errorCode
        );
          "%c[RecoverPage] Error description param:",
          "color: red; font-weight: bold;",
          errorDescription
        );

        if (errorParam) {
          setErrorMsg(
            `Error: ${errorCode || errorParam} - ${decodeURIComponent(
              errorDescription || ""
            )}`
          );
          setSession(null);
          setLoading(false);
          return;
        }

        if (!token || type !== "recovery") {
          setErrorMsg(
            "No se encontró un token de recuperación válido en la URL."
          );
          setSession(null);
          setLoading(false);
          return;
        }

        // Verificar el token de recuperación con Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token,
          type,
        } as any);

        if (error) {
          let message = "Error al verificar el token: " + error.message;
          if (error.message === "invalid flow state, flow state has expired") {
            message =
              "El enlace de recuperación ha expirado o es inválido. Por favor, solicita un nuevo enlace.";
          }
          if (
            error.message ===
            "code challenge does not match previously saved code verifier"
          ) {
            message =
              "El código de verificación no coincide. Por favor, intenta solicitar un nuevo enlace de recuperación.";
          }
          if (error.message === "Email link is invalid or has expired") {
            message =
              "El enlace de recuperación es inválido o ha expirado. Por favor, solicita un nuevo enlace.";
          }
          setErrorMsg(message);
          setSession(null);
        } else if (data.session) {
          setSession(data.session);
          if (redirectTo) {
            window.history.replaceState(null, "", redirectTo);
          }
        } else {
          setErrorMsg("No se pudo obtener la sesión.");
          setSession(null);
        }
      } catch (errorCatch) {
        let message = "Error inesperado al procesar la URL.";
        if (
          typeof errorCatch === "object" &&
          errorCatch !== null &&
          "message" in errorCatch
        ) {
          message = (errorCatch as any).message;
        }
        setErrorMsg(message);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    getSessionFromUrl();
  }, [supabase.auth]);

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
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "auto",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333" }}>
          Restablecer contraseña
        </h1>
        <p style={{ color: "red", fontWeight: "600", marginBottom: "1.5rem" }}>
          {errorMsg || "El enlace no es válido o ya expiró."}
        </p>
        <button
          onClick={() => {
            router.push("/auth/recover");
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e40af")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          Solicitar nuevo enlace de recuperación
        </button>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Si no recibes el correo, revisa tu carpeta de spam o intenta
          nuevamente más tarde.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: "2rem",
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          marginBottom: "1rem",
          color: "#333",
          textAlign: "center",
        }}
      >
        Restablecer contraseña
      </h1>
      {errorMsg && (
        <p
          style={{
            color: "red",
            fontWeight: "600",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          Nueva contraseña:
        </label>
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
            marginBottom: "1rem",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e40af")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
}
