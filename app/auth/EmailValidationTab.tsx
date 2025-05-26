"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";

const RESEND_INTERVAL = 60; // seconds

const emailSchema = z.string().email();

type ResendStatus = "idle" | "sending" | "cooldown" | "error" | "success";

export default function EmailValidationTab() {
  const [status, setStatus] = useState<ResendStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [email, setEmail] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Load timer and email from localStorage
  useEffect(() => {
    try {
      const savedTimestamp = localStorage.getItem("resendEmailCooldownEndsAt");
      const savedEmail = localStorage.getItem("resendEmailAddress");
      if (savedEmail) setEmail(savedEmail);
      if (savedTimestamp) {
        const cooldownEndsAt = parseInt(savedTimestamp);
        const now = Date.now();
        if (cooldownEndsAt > now) {
          const remaining = Math.ceil((cooldownEndsAt - now) / 1000);
          setTimer(remaining);
          setStatus("cooldown");
          startCooldownTimer(remaining);
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // Cooldown timer logic
  const startCooldownTimer = (seconds: number) => {
    setTimer(seconds);
    setStatus("cooldown");
    if (cooldownTimeout.current) clearInterval(cooldownTimeout.current);
    cooldownTimeout.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (cooldownTimeout.current) clearInterval(cooldownTimeout.current);
          setStatus("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Polling for email validation status
  useEffect(() => {
    if (isValidating) return;
    if (status === "success" || status === "idle") {
      pollingInterval.current = setInterval(async () => {
        setIsValidating(true);
        try {
          const res = await fetch("/api/auth/check-email-validated");
          const data = await res.json();
          if (data.validated) {
            window.location.href = data.redirectUrl || "/";
          }
        } catch {
          // ignore errors
        } finally {
          setIsValidating(false);
        }
      }, 60000);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [status, isValidating]);

  // Email format validation
  const isEmailValid = emailSchema.safeParse(email).success;

  const handleResendEmail = async () => {
    if (status === "sending" || status === "cooldown") return;
    if (!isEmailValid) {
      setMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }
    setStatus("sending");
    setMessage(null);
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        // Map error codes to user-friendly messages if needed
        setMessage(error.message);
        toast.error(error.message);
        setStatus("error");
      } else {
        const successMessage =
          "Correo de confirmación reenviado correctamente.";
        setMessage(successMessage);
        toast.success(successMessage);
        setStatus("success");
        const cooldownEndsAt = Date.now() + RESEND_INTERVAL * 1000;
        try {
          localStorage.setItem(
            "resendEmailCooldownEndsAt",
            cooldownEndsAt.toString()
          );
          localStorage.setItem("resendEmailAddress", email);
        } catch {
          // ignore localStorage errors
        }
        startCooldownTimer(RESEND_INTERVAL);
      }
    } catch {
      setMessage("Error al reenviar el correo de confirmación.");
      toast.error("Error al reenviar el correo de confirmación.");
      setStatus("error");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Confirma tu correo electrónico
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Por favor, ingresa tu correo electrónico y sigue el enlace para
        confirmar tu cuenta.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setMessage(null);
          setStatus("idle");
        }}
        placeholder="correo@ejemplo.com"
        aria-label="Correo electrónico"
        className="w-full mb-4 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
      />
      <button
        onClick={handleResendEmail}
        disabled={status === "sending" || status === "cooldown"}
        aria-busy={status === "sending"}
        aria-disabled={status === "sending" || status === "cooldown"}
        aria-live="polite"
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        {status === "sending"
          ? "Enviando..."
          : status === "cooldown"
            ? `Reenvío disponible en ${timer}s`
            : "Reenviar correo de confirmación"}
      </button>
      {message && (
        <p
          className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
