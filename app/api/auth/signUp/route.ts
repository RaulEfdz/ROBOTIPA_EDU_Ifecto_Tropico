import { db } from "@/lib/db";
import { getVisitorId } from "@/utils/roles/translate";
import { NextResponse } from "next/server";
import { log, LogLevel } from "@/utils/debug/log";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailAddress, emailVerified, id, deviceType } = body;

    log(LogLevel.DEBUG, "Datos recibidos en el body", { body });

    if (!id || !emailAddress || emailVerified === undefined || !deviceType) {
      log(LogLevel.WARN, "Campos faltantes o inválidos", {
        id,
        emailAddress,
        emailVerified,
        deviceType,
      });
      return NextResponse.json(
        { error: "Faltan datos obligatorios o datos no válidos" },
        { status: 400 }
      );
    }

    const visitorRoleId = getVisitorId();
    log(LogLevel.DEBUG, "visitorRoleId obtenido", { visitorRoleId });

    const userPayload = {
      id,
      email: emailAddress,
      fullName: "",
      username: emailAddress.split("@")[0],
      customRole: visitorRoleId,
      provider: "custom",
      lastSignInAt: new Date(),
      isActive: true,
      isDeleted: false,
      isBanned: false,
      additionalStatus: "pending",
      metadata: {
        isEmailVerified: emailVerified,
        deviceType,
      },
    };

    log(LogLevel.DEBUG, "Payload de creación de usuario", { userPayload });

    const createdUser = await db.user.create({ data: userPayload });

    log(LogLevel.INFO, "Usuario creado exitosamente", { user: createdUser });

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error: any) {
    log(LogLevel.ERROR, "Error en registro de usuario", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
