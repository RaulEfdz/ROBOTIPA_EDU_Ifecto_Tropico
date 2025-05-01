"use client";

import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getAdminId, getTeacherId } from "@/utils/roles/translate";

export const isTeacher = async (userId?: string): Promise<boolean> => {
  try {
    if (!userId) return false;

    const user = await getCurrentUserFromDB();
    const customRole = user?.customRole;

    const allowedRoles = [getTeacherId(), getAdminId()];
    const hasAccess = customRole ? allowedRoles.includes(customRole) : false;

    return hasAccess;
  } catch (error) {
    console.error("Error al verificar el rol del usuario:", error);
    return false;
  }
};
