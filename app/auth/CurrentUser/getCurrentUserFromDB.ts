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

export async function getCurrentUserFromDB(): Promise<UserDB | null> {
  try {
    const response = await fetch("/api/auth/getUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("❌ Error al obtener el usuario desde la API:", response.status);
      return null;
    }

    const user: UserDB = await response.json();
    return user;
  } catch (error) {
    console.error("❌ Error inesperado al obtener usuario:", error);
    return null;
  }
}
