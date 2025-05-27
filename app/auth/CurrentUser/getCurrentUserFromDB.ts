"use client";

export interface UserDB {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone: string | null;
  customRole: string;
  provider: string;
  lastSignInAt: string | null;
  metadata: Record<string, any>;
  isActive: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  additionalStatus: string;
  createdAt: string;
  updatedAt: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function getCurrentUserFromDB(): Promise<UserDB | null> {
  try {
    const token = getCookie("sb-access-token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/auth/getUser", {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "❌ Error al obtener el usuario desde la API:",
        response.status
      );
      return null;
    }

    const user: UserDB = await response.json();
    return user;
  } catch (error) {
    console.error("❌ Error inesperado al obtener usuario:", error);
    return null;
  }
}
