import { NextResponse } from "next/server";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { registerOrSyncUser } from "../insertUser/registerOrSyncUser";
import { getUserById } from "./getUserById";

export async function GET() {
  const session = await getUserDataServerAuth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userData = await getUserById(user.id);

  if (!userData) {
    const result = await registerOrSyncUser(user, () => {});

    if (result === "error") {
      return NextResponse.json({ error: "Error registering/syncing user" }, { status: 500 });
    }

    userData = await getUserById(user.id);

    if (!userData) {
      return NextResponse.json({ error: "User still not found after sync" }, { status: 404 });
    }
  }

  return NextResponse.json(userData, { status: 200 });
}
