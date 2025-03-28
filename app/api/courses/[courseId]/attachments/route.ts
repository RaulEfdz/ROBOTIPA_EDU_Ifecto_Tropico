import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

export async function POST(
  req: Request,
  { params }: any
) {
  try {
    
    const { url, res } = await req.json();
    
  

    const user = (await getUserDataServer())?.user;
    
      if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: user?.id,
        delete: false,
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // name: url.split("/").pop(),
    const attachment = await db.attachment.create({
      data: {
        url,
        name: String(replaceSpecialCharacters(res.fileName.split('.')[0])+'__'+getFileExtension(res.fileName)), 
        courseId: params.courseId,
      }
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


function replaceSpecialCharacters(text: string): string {
  // List of special characters to replace, including white space.
  const specialCharacters: string[] = [
    ' ', '"', "'", "?", "*", "\\", "/", ":", "<", ">", "|", "+", ",", ";", "¿", "¡",
  ];

  // List of replacement characters, using '_' for white space.
  const replacementCharacters: string[] = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

  // Replace the special characters.
  for (let i = 0; i < specialCharacters.length; i++) {
    // Escaping special characters that are also regex operators.
    let escapedCharacter = specialCharacters[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    text = text.replace(new RegExp(escapedCharacter, "g"), replacementCharacters[i]);
  }

  // Return the text with the changes made.
  return text;
}

function getFileExtension(filename: string): string {
  // Encuentra la posición del último punto en el nombre del archivo.
  const lastDotIndex = filename.lastIndexOf('.');

  // Si no hay un punto o está al principio, se considera que no hay extensión.
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return '';
  }

  // Devuelve la cadena después del último punto.
  return filename.substring(lastDotIndex + 1);
}