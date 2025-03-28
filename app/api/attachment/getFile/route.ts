import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { eid } = await req.json();

    if (!eid) {
      return NextResponse.json(
        { error: "Missing eid parameter" },
        { status: 400 }
      );
    }

    // Consulta a la base de datos utilizando Prisma
    const response = await db.attachment.findUnique({
      where: { id: eid },
      select: { name: true, url: true }, // Solo trae los campos necesarios para optimización
    });

    if (response && response.url) {
      return NextResponse.json({ fileUrl: response.url }, { status: 200 });
    } else {
      throw new Error("File URL not found for the given eid");
    }
  } catch (error: any) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
