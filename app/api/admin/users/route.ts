import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

const ALLOWED_ROLES = ["admin", "teacher"];

async function checkPermissions() {
  const session = await getUserDataServerAuth();
  if (!session || !session.user) return false;
  const user = session.user;
  const role = user.user_metadata?.custom_role || user.role || "";
  if (ALLOWED_ROLES.includes(translateRole(role))) {
    return true;
  }
  return false;
}

export async function GET() {
  const users = await db.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ users });
}
