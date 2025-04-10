import { db } from "@/lib/db";
import { printDebug } from "@/utils/debug/log";

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
