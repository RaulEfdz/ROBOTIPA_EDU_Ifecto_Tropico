import { db } from "@/lib/db";
import { getVisitorId } from "@/utils/roles/translate";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailAddress, emailVerified, id, deviceType } = body;


    if (!id || !emailAddress || emailVerified === undefined || !deviceType) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios o datos no válidos" },
        { status: 400 }
      );
    }

    const visitorRoleId = getVisitorId();

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


    const createdUser = await db.user.create({ data: userPayload });


    return NextResponse.json({ success: true, user: createdUser });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
