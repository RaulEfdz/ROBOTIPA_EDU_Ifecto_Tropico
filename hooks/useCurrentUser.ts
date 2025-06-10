"use client";
import { useState, useEffect } from "react";

// Mejorar tipado para user
export interface UserSession {
  id: string;
  email?: string;
  fullName?: string;
  [key: string]: any;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
