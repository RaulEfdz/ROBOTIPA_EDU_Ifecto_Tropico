// app/api/auth/insertUser/route.ts

import { NextResponse } from "next/server";
import { registerOrSyncUser } from "./registerOrSyncUser";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET() {
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
    }

    const wasCreated = await registerOrSyncUser(user, () => {});

    return NextResponse.json({
      success: true,
      message: wasCreated ? "Usuario registrado" : "Usuario ya existe",
    });
  } catch (error) {
    console.error("❌ Error en /api/auth/insertUser:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
