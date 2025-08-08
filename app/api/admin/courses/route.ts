import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

const ALLOWED_ROLES = ["admin", "teacher"];

async function checkPermissions() {
  const session = await getUserDataServerAuth();
  if (!session || !session.user) return false;
  const user = session.user;
  if (
    ALLOWED_ROLES.includes(translateRole(user.role)) ||
    ALLOWED_ROLES.includes(translateRole(user.user_metadata?.custom_role))
  ) {
    return true;
  }
  return false;
}

export async function GET() {
  // const hasPermission = await checkPermissions();
  // if (!hasPermission) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // }

  const courses = await db.course.findMany({
    where: {
      delete: {
        not: true // Excluir cursos marcados como eliminados
      }
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json({ courses });
}
