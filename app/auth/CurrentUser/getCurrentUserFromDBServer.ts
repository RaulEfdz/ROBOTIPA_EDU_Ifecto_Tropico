import { db } from "@/lib/db";
import { printDebug } from "@/utils/debug/log";
import { getUserDataServerAuth } from "./userCurrentServerAuth";

export const getCurrentUserFromDBServer = async () => {
  const route = "getCurrentUserFromDBServer";
  try {


    const session=  await getUserDataServerAuth()

    if (!session) {
      printDebug(`${route} > ❌ Usuario no autenticado`);
      return null;
    }

    const user = session.user;

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      printDebug(`${route} > ❌ Usuario no encontrado en BD`);
      return null;
    }

    printDebug(`${route} > ✅ Usuario encontrado: ${dbUser.email}`);
    return dbUser;
  } catch (error) {
    printDebug(`${route} > ❌ Error: ${(error as Error).message}`);
    return null;
  }
};
