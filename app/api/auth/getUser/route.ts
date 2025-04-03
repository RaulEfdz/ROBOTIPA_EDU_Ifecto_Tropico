import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { printDebug } from "@/utils/debug/log";
import { createClient } from "@/utils/supabase/server";

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
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await (await supabase).auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await getUserById(user.id);

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userData, { status: 200 });
}
