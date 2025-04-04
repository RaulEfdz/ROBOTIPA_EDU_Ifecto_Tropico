
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { getAdminId, getTeacherId } from "@/utils/roles/translate";

export const isTeacher_server = async (userId?: string): Promise<boolean> => {
  try {
    if (!userId) return false;

    const user = await getCurrentUserFromDBServer();
    const customRole = user?.customRole;

    console.log("customRole UUID ---------->:", customRole);

    const allowedRoles = [getTeacherId(), getAdminId()];
    const hasAccess = customRole ? allowedRoles.includes(customRole) : false;

    return hasAccess;
  } catch (error) {
    console.error("Error al verificar el rol del usuario:", error);
    return false;
  }
};
