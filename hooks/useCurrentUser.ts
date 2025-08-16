"use client";
import { useState, useEffect } from "react";
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

export function useCurrentUser() {
  const [user, setUser] = useState<UserDB | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/getUser", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
