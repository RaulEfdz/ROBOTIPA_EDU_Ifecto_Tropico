import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ClerkUserData, User, UserProfile, UserResponse } from "@/prisma/types";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<UserResponse>(
        {
          success: false,
          clerkUser: {} as ClerkUserData,
          dbUser: {} as UserProfile,
          error: "No se ha proporcionado un ID de usuario autenticado.",
        },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json<UserResponse>(
        {
          success: false,
          clerkUser: {} as ClerkUserData,
          dbUser: {} as UserProfile,
          error: `No se encontró el usuario en Clerk con ID ${userId}.`,
        },
        { status: 404 }
      );
    }

    const user: any = await db.user.findUnique({
      where: { id: userId },
    });

    const clerkUserData: ClerkUserData = {
      id: clerkUser.id,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      email: clerkUser.emailAddresses[0]?.emailAddress || "Sin correo",
      username: clerkUser.username || "Sin username",
      profileImageUrl: clerkUser.imageUrl || "",
      phoneNumber: clerkUser.phoneNumbers?.[0]?.phoneNumber || "Sin teléfono",
      publicMetadata: clerkUser.publicMetadata || {},
      privateMetadata: clerkUser.privateMetadata || {},
    };

    if (!user) {
      const response: UserResponse = {
        success: true,
        clerkUser: clerkUserData,
        dbUser: null,
        error: `Usuario con ID ${userId} no encontrado en la base de datos.`,
      };
      return NextResponse.json(response);
    } else {
      const response: UserResponse = {
        success: true,
        clerkUser: clerkUserData,
        dbUser: user,
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("[ERROR IN GET USER INFO]", error);
    return NextResponse.json<UserResponse>(
      {
        success: false,
        clerkUser: {} as ClerkUserData,
        dbUser: {} as UserProfile,
        error: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
