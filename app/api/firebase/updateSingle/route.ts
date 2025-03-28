import { updateArrayAdd, updateKey } from "@/lib/firebase/handlerData";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nameCollection, id, arrayName, dataToAdd, replaceExisting } = await req.json();

    if(replaceExisting){
      await updateKey(nameCollection, id, arrayName, dataToAdd)
    }else{
      await updateArrayAdd(nameCollection, id, arrayName, dataToAdd);
    }

    return NextResponse.json(
      { message: "Documento actualizado exitosamente", ok: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar documento:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
