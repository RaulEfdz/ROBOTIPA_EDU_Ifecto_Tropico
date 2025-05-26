import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";

const RESEND_INTERVAL = 60; // seconds

const emailSchema = z.string().email();

type ResendStatus = "idle" | "sending" | "cooldown" | "error" | "success";

export function useEmailResend(initialEmail: string = "") {
  const [status, setStatus] = useState<ResendStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [email, setEmail] = useState(initialEmail);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);

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
      if (cooldownTimeout.current) clearInterval(cooldownTimeout.current);
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

  // Email format validation
  const isEmailValid = emailSchema.safeParse(email).success;

  const resendEmail = async () => {
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

  return {
    email,
    setEmail,
    status,
    message,
    timer,
    resendEmail,
  };
}
