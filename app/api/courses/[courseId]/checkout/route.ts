import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateRandomId } from "@/tools/generateRandomId";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

// Esta función maneja las solicitudes HTTP POST
export async function POST(req: Request, { params }: any) {
  try {
    // Obtiene el usuario actual
    const user = (await getUserDataServerAuth())?.user;

    // Comprueba si el usuario existe y tiene la información necesaria
    if (!user || !user.id || !user.email) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Busca un curso con el ID proporcionado en los parámetros
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
        delete: false,
      }
    });

    // Busca una compra existente con el mismo usuario y curso
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      }
    });

    // Si ya se ha realizado una compra, devuelve un error 400
    if (purchase) {
      return new NextResponse("Ya se ha comprado el curso", { status: 400 });
    }

    // Si no se encuentra el curso, devuelve un error 404
    if (!course) {
      return new NextResponse("Curso no encontrado", { status: 404 });
    }

    // Crea un registro de compra en la base de datos
    await db.purchase.create({
      data: {
        userId: user.id,
        courseId: params.courseId,
      }
    });

    // Genera una URL de éxito y la devuelve como respuesta JSON
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/courses/${params.courseId}?success=1`;
    return NextResponse.json({ url: successUrl });
  } catch (error) {
    console.error("[COURSE_ID_CHECKOUT]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// Función para verificar o crear una cuenta de Stripe para un usuario
const verifyOrCreateAccount = async (userId: string) => {
  try {
    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId: userId },
      select: { stripeCustomerId: true }
    });
    // Si no existe una cuenta de Stripe para el usuario, crea una con valores de prueba
    if (!stripeCustomer) {
      // const testValues = generateRandomTestValues();
      const idRandom = generateRandomId(12)
      stripeCustomer = await db.stripeCustomer.create({
        data: {
          userId: userId,
          stripeCustomerId: idRandom,
        }
      });
      return true;
    } else {
      return `El usuario ${userId} ya tiene una cuenta de Stripe asociada`;
    }
  } catch (error) {
    console.error("Error al verificar o crear cuenta de Stripe:", error);
    throw new Error("Error al procesar la cuenta de Stripe");
  }
};
