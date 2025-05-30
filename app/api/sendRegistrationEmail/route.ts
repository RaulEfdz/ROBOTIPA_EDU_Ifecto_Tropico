import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

const EMAIL_FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS || "no-reply@infectotropico.com";
const NOTIFY_EMAIL = "info@infectotropico.com";
const APP_NAME = process.env.NEXT_PUBLIC_NAME_APP || "Infecto Tropico";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, pais, profesion, institucion, telefono } =
      await req.json();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 }
      );
    }

    if (!EMAIL_FROM_ADDRESS) {
      return NextResponse.json(
        { error: "Email sending configuration missing" },
        { status: 500 }
      );
    }

    const subject = `Nueva inscripción en ${APP_NAME}`;
    const html = `
      <p>Hola,</p>
      <p>Se ha inscrito una nueva persona en ${APP_NAME}.</p>
      <p><strong>Nombre:</strong> ${fullName}</p>
      <p><strong>Correo electrónico:</strong> ${email}</p>
      <p><strong>País:</strong> ${pais || "No especificado"}</p>
      <p><strong>Profesión:</strong> ${profesion || "No especificada"}</p>
      <p><strong>Institución:</strong> ${institucion || "No especificada"}</p>
      <p><strong>Teléfono:</strong> ${telefono || "No especificado"}</p>
      <p>Por favor, revisa los detalles en el sistema.</p>
    `;

    try {
      await resend.emails.send({
        from: `${APP_NAME} <${EMAIL_FROM_ADDRESS}>`,
        to: NOTIFY_EMAIL,
        subject,
        html,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Error sending notification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Notification email sent",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
