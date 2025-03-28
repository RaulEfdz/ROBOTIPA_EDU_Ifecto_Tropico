"use client"
import { getUserData } from "@/app/(auth)/auth/userCurrent";

export const isTeacher = async (userId?: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    // Extraemos el rol personalizado directamente
        const userData = await getUserData();
        const customRole = userData?.user.identities[0].identity_data.custom_role;
console.log("customRole ----------:", customRole);
    const state =
      customRole === "teacher" ||
      customRole === "admin" ||
      customRole === "developer";
    return customRole ? state : false;
  } catch (error) {
    console.error("Error al verificar el rol del usuario:", error);
    return false;
  }
};
