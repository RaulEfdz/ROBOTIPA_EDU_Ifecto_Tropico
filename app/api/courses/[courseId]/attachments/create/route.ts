import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  if (!courseId) {
  try {
    const { url, res } = await req.json();

    const user = (await getCurrentUserFromDBServer());
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name: String(
          replaceSpecialCharacters(res.fileName.split(".")[0]) +
            "__" +
            getFileExtension(res.fileName)
        ),
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("[ATTACHMENT_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
}

function replaceSpecialCharacters(text: string): string {
  const specialCharacters = [
    " ", '"', "'", "?", "*", "\\", "/", ":", "<", ">", "|", "+", ",", ";", "¿", "¡",
  ];
  const replacementCharacters = specialCharacters.map(() => "_");

  for (let i = 0; i < specialCharacters.length; i++) {
    const escapedCharacter = specialCharacters[i].replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
    text = text.replace(new RegExp(escapedCharacter, "g"), replacementCharacters[i]);
  }

  return text;
}

function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex === -1 || lastDotIndex === 0
    ? ""
    : filename.substring(lastDotIndex + 1);
}
