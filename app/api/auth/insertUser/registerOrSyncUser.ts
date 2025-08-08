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
    printDebug(
      `${route} > Verificando existencia del usuario con ID: ${user.id}`
    );

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
    const userMetadata = user.user_metadata || {};

    // Extraer campos que coinciden con columnas de la tabla User
    const fullName =
      userMetadata.full_name || identity?.identity_data?.full_name || "No name";
    const phone = (userMetadata as any).telefono || user.phone || null;

    // Construir metadata excluyendo los campos que se guardarán en columnas separadas
    // Para evitar error TS, usar index signature para acceder a propiedades dinámicas
    const {
      full_name,
      // @ts-ignore
      telefono,
      // Excluir otros campos que se guardan en columnas si es necesario
      ...restMetadata
    } = userMetadata;

    const serializedMetadata = JSON.parse(JSON.stringify(restMetadata));

    const newUserData = {
      email: user.email,
      fullName,
      username: identity?.identity_data?.username || "no-username",
      phone,
      customRole,
      provider: identity?.provider || "unknown",
      lastSignInAt: user.last_sign_in_at
        ? new Date(user.last_sign_in_at)
        : new Date(),
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
      //codigo sirve para detectar coambios en la info de auth y la user y igualar la tabal user a la auth
      if (hasChanges) {
        printDebug(
          `${route} > 🔄 Diferencias encontradas, actualizando usuario`
        );

        // Excluir el campo `customRole` de la sincronización
        const { customRole: _, ...newUserDataWithoutCustomRole } = newUserData;

        await db.user.update({
          where: { id: user.id },
          data: {
            ...newUserDataWithoutCustomRole,
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
    return "error";
  }
};
