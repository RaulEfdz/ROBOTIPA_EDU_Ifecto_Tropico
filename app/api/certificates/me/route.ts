import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET() {
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const certificates = await db.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json(certificates);
  } catch (error) {
    console.error("[CERTIFICATES_ME_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
