// app/api/users/updateRole/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Lista de roles válidos permitidos

// Obtener el STUDENT_ID desde las variables de entorno
// Asegúrate de que esta variable esté definida en tu archivo .env
const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

const validRoles = [TEACHER_ID, STUDENT_ID, ADMIN_ID, VISITOR_ID];
// const validRoles = ["admin"];

// Opcional: Validar que TEACHER_ID esté configurado al iniciar la aplicación
// En un caso real, podrías querer lanzar un error o advertencia aquí si no está
if (!VISITOR_ID) {
  console.error(
    "FATAL ERROR: VISITOR_ID not defined in environment variables."
  );
  // En una aplicación real, podrías considerar lanzar un error de inicio aquí
  // process.exit(1);
}

export async function POST(req: NextRequest) {
  try {
    const { id, customRole } = await req.json();

    // Validaciones mínimas iniciales
    if (!id || !customRole) {
      return NextResponse.json(
        { error: "Faltan datos: 'id' y 'customRole' son requeridos" },
        { status: 400 }
      );
    }

    // Variable para almacenar el rol final con el que se realizará la actualización
    let roleToUpdateWith = customRole;
    let message = `Rol actualizado correctamente a '${customRole}'`; // Mensaje por defecto

    // --- Lógica para manejar el rol del profesor ---
    // Verificar si el ID del usuario a actualizar coincide con el VISITOR_ID
    if (VISITOR_ID && id === VISITOR_ID) {
      // Si es el profesor, forzar el rol a 'teacher'
      roleToUpdateWith = "teacher";
      // Opcional: Añadir un mensaje específico si se fuerza el rol
      if (customRole !== "teacher") {
        message = `El usuario es el profesor (${id}). Su rol ha sido forzado a 'teacher', ignorando el rol solicitado '${customRole}'.`;
      } else {
        message = `El usuario es el profesor (${id}). Su rol 'teacher' se ha confirmado.`;
      }
      // No se realiza validación adicional contra validRoles para el profesor,
      // ya que siempre será 'teacher'.
    } else {
      // Si NO es el profesor, validar que el customRole solicitado sea válido
      if (!validRoles.includes(customRole)) {
        return NextResponse.json(
          {
            error: `Rol inválido, Debe ser uno de: ${validRoles.join(", ")}`,
          },
          { status: 400 }
        );
      }
      // Si es un rol válido y no es el profesor, usamos el customRole solicitado
      roleToUpdateWith = VISITOR_ID;
      message = `Rol actualizado correctamente'.`;
    }
    // --- Fin de la lógica para manejar el rol del profesor ---

    // Realizar la actualización en la base de datos con el rol determinado
    const updatedUser = await db.user.update({
      where: { id },
      data: { customRole: roleToUpdateWith },
    });

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: message, // Usamos el mensaje que generamos
      user: updatedUser,
    });
  } catch (error) {
    console.error("[ERROR UPDATING ROLE]", error);
    // Respuesta de error del servidor
    return NextResponse.json(
      { error: "Error interno del servidor al intentar actualizar el rol" },
      { status: 500 }
    );
  }
}
