import { SupabaseUser } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { db } from "@/lib/db";
import { printDebug } from "@/utils/debug/log";
import { getVisitorId } from "@/utils/roles/translate";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export const registerOrSyncUser = async (
  user: SupabaseUser,
  callback: () => void
): Promise<"created" | "updated" | "unchanged" | "error"> => {
  const route = "registerOrSyncUser";

  try {
    printDebug(`${route} > Verificando existencia del usuario con ID: ${user.id}`);

    const existingUser = await db.user.findUnique({
      where: { id: user.id },
    });

    const identity = user.identities?.[0];

    // Validar y asignar customRole
    let customRole = identity?.identity_data?.custom_role;
    if (!customRole || !uuidSchema.safeParse(customRole).success) {
      customRole = getVisitorId();
    }

    // Serializar metadata de forma segura
    const serializedMetadata = JSON.parse(JSON.stringify(user.user_metadata));

    const newUserData = {
      email: user.email,
      fullName: identity?.identity_data?.full_name || "No name",
      username: identity?.identity_data?.username || "no-username",
      phone: user.phone || null,
      customRole,
      provider: identity?.provider || "unknown",
      lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date(),
      metadata: serializedMetadata,
    };

    if (!existingUser) {
      printDebug(`${route} > Usuario no existe, registrando nuevo usuario`);

      await db.user.create({
        data: {
          id: user.id,
          ...newUserData,
        },
      });

      printDebug(`${route} > ✅ Usuario registrado correctamente`);
      callback();
      return "created";
    } else {
      const hasChanges = Object.entries(newUserData).some(([key, value]) => {
        const existingValue = existingUser[key as keyof typeof newUserData];
        return JSON.stringify(existingValue) !== JSON.stringify(value);
      });

      if (hasChanges) {
        printDebug(`${route} > 🔄 Diferencias encontradas, actualizando usuario`);

        await db.user.update({
          where: { id: user.id },
          data: {
            ...newUserData,
            updatedAt: new Date(),
          },
        });

        printDebug(`${route} > ✅ Usuario actualizado correctamente`);
        callback();
        return "updated";
      } else {
        printDebug(`${route} > ℹ️ Usuario ya estaba sincronizado`);
        callback();
        return "unchanged";
      }
    }
  } catch (error) {
    printDebug(`${route} > ❌ Error: ${(error as Error).message}`);
    console.error("❌ Error registrando/sincronizando usuario:", error);
    return "error";
  }
};
