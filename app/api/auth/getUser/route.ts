import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { printDebug } from "@/utils/debug/log";
import { createClient } from "@/utils/supabase/server";
import { registerOrSyncUser } from "../insertUser/registerOrSyncUser";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

// Si tienes el tipo `SupabaseUser`, impórtalo (ajusta el path si es necesario)
import type { User as SupabaseUser } from "@supabase/auth-js";

// Función para obtener el usuario desde la BD por ID
export const getUserById = async (userId: string) => {
  const route = "getUserById";

  try {
    printDebug(`${route} > Buscando usuario con ID: ${userId}`);

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      printDebug(`${route} > ❌ Usuario no encontrado`);
      return null;
    }

    printDebug(`${route} > ✅ Usuario encontrado`);
    return user;
  } catch (error) {
    printDebug(`${route} > ❌ Error: ${(error as Error).message}`);
    console.error("❌ Error al buscar usuario:", error);
    return null;
  }
};

// Handler de la ruta GET
export async function GET() {
  const session = await getUserDataServerAuth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userData = await getUserById(user.id);

  if (!userData) {
    printDebug("GET > Usuario no encontrado, intentando registrar o sincronizar...");

    const result = await registerOrSyncUser(user, () => {});

    if (result === "error") {
      return NextResponse.json({ error: "Error registering/syncing user" }, { status: 500 });
    }

    userData = await getUserById(user.id);

    if (!userData) {
      return NextResponse.json({ error: "User still not found after sync" }, { status: 404 });
    }
  }

  return NextResponse.json(userData, { status: 200 });
}
