import { db } from "@/lib/db";
import { SupabaseUser } from "../CurrentUser/userCurrentAuth";
import { getVisitorId } from "@/utils/roles/translate"; // Asegúrate de tener isValidRole
import { z } from "zod";

// Validador de UUID (opcional)
const uuidSchema = z.string().uuid();

export async function syncUserWithDatabase(user: SupabaseUser) {
  const { id, email, phone, last_sign_in_at, app_metadata, user_metadata } = user;

  let customRole = user_metadata.custom_role;

  // Validar si el custom_role es un UUID válido, si no asignar visitor
  if (!customRole || !uuidSchema.safeParse(customRole).success) {
    customRole = getVisitorId();
  }

  const data = {
    email,
    phone,
    fullName: user_metadata.full_name || "",
    username: user_metadata.username || email?.split("@")[0] || "no-username",
    customRole,
    provider: app_metadata.provider || "unknown",
    lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : new Date(),
    metadata: user_metadata as any,
    isActive: true,
    isDeleted: false,
    isBanned: false,
    additionalStatus: "active",
  };
  

  await db.user.upsert({
    where: { id },
    update: data,
    create: { id, ...data },
  });

  console.debug(`[syncUserWithDatabase] Usuario sincronizado: ${id}`);
}
