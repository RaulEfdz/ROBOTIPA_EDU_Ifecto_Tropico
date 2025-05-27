import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "../../../../utils/supabase/server";
import { resend } from "@/lib/resend";

const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS;
const NEXT_PUBLIC_NAME_APP =
  process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Check if user exists
    const { data: users, error: fetchError } = await supabase
      .from("auth.users")
      .select("id, email, email_confirmed_at")
      .eq("email", email)
      .limit(1)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Error fetching user" },
        { status: 500 }
      );
    }

    if (!users) {
      return NextResponse.json({ status: "not_found" });
    }

    if (users.email_confirmed_at) {
      return NextResponse.json({ status: "already_validated" });
    }

    if (!EMAIL_FROM_ADDRESS) {
      return NextResponse.json(
        { error: "Email sending configuration missing" },
        { status: 500 }
      );
    }

    const appName = NEXT_PUBLIC_NAME_APP || "Tu Plataforma";

    // Compose email content (simple example, can be replaced with templates)
    const userEmailSubject = `Confirma tu correo electrónico - ${appName}`;
    const userEmailHtmlBody = `
      <p>Hola,</p>
      <p>Por favor, confirma tu correo electrónico para completar el registro en ${appName}.</p>
      <p>Si no solicitaste este correo, puedes ignorarlo.</p>
    `;

    try {
      await resend.emails.send({
        from: `${appName} <${EMAIL_FROM_ADDRESS}>`,
        to: email,
        subject: userEmailSubject,
        html: userEmailHtmlBody,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Error sending confirmation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Confirmation email resent via Resend",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
