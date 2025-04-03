import { db } from "@/lib/db";
import { getVisitorId } from "@/utils/roles/translate";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailAddress, emailVerified, id, deviceType } = body;

    console.debug("[DEBUG] Datos recibidos en el body:", body);

    if (!id || !emailAddress || emailVerified === undefined || !deviceType) {
      console.warn("[DEBUG] Campos faltantes o inválidos:", {
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
    console.debug("[DEBUG] visitorRoleId obtenido:", visitorRoleId);

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

    console.debug("[DEBUG] Payload de creación de usuario:", userPayload);

    const createdUser = await db.user.create({ data: userPayload });

    console.info("[INFO] Usuario creado exitosamente:", createdUser);

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error) {
    console.error("[ERROR EN REGISTRO DE USUARIO]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
