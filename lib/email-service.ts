import { resend } from "@/lib/resend";
import { User, Course } from "@prisma/client"; // Asumiendo que los tipos de Prisma están disponibles
import { getCurrentUserFromDBServer as getCurrentUser } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { db } from "@/lib/db";

// Cargar variables de entorno de forma segura
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS;
const APP_NAME = process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!EMAIL_FROM) {
  console.error(
    "CRITICAL: EMAIL_FROM_ADDRESS is not configured for email-service."
  );
}

interface EnrollmentDetails {
  user: Pick<User, "id" | "email" | "fullName" | "username">;
  course: Pick<Course, "id" | "title" | "price">;
  purchaseId: string;
  transactionDetails?: string; // Opcional, si tienes más detalles de la transacción
}

/**
 * Envía correos de confirmación de inscripción al usuario y al administrador.
 */
export async function sendEnrollmentConfirmationEmails({
  user,
  course,
  purchaseId,
  transactionDetails,
}: EnrollmentDetails): Promise<void> {
  if (!EMAIL_FROM) {
    console.error(
      "Cannot send enrollment emails: EMAIL_FROM is not configured."
    );
    return;
  }

  if (!user.email) {
    console.warn(
      `User ${user.id} does not have an email address. Skipping user confirmation email.`
    );
  }

  const userName = user.fullName || user.username || "Valioso Estudiante";
  const coursePriceFormatted =
    course.price !== null ? `$${course.price.toFixed(2)}` : "Gratis";
  const appName = APP_NAME;
  const appUrl = APP_URL;
  // Determinar si es un registro manual basado en transactionDetails (debe estar disponible para ambos bloques)
  const isManualFlow =
    transactionDetails?.toLowerCase().includes("manual") ||
    transactionDetails?.toLowerCase().includes("otorgado manualmente");

  // --- Email para el Cliente ---
  if (user.email) {
    const userEmailSubject = `Confirmación de Acceso al Curso: ${course.title}`;
    const enrollmentTypeMessage = isManualFlow
      ? `Te confirmamos que se ha activado tu acceso mediante <strong>registro manual</strong> al curso:`
      : `Queremos confirmarte que tu inscripción al curso "<strong>${course.title}</strong>" ha sido procesada con éxito.`;
    const userEmailHtmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #2a9d8f; text-align: center;">¡Acceso Confirmado en ${appName}!</h1>
          <p>Hola ${userName},</p>
          <p>${enrollmentTypeMessage}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <h2 style="color: #333; font-size: 1.1em; margin-top: 0;">Detalles del Curso:</h2>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Curso:</strong> ${course.title}</li>
              <li><strong>Referencia de Acceso/Compra:</strong> ${purchaseId}</li>
              ${isManualFlow && transactionDetails ? `<li><strong>Observaciones:</strong> ${transactionDetails}</li>` : ""}
              ${!isManualFlow && coursePriceFormatted !== "Gratis" ? `<li><strong>Precio Pagado:</strong> ${coursePriceFormatted}</li>` : ""}
            </ul>
          </div>
          <p style="margin-top: 20px;">Puedes acceder a tu curso ahora mismo haciendo clic en el siguiente enlace:</p>
          <p style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/courses/${course.id}" 
               style="background-color: #2a9d8f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Ir al Curso
            </a>
          </p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo o visitando nuestra sección de ayuda.</p>
          <p>¡Gracias por ser parte de ${appName}!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 0.85em; color: #777; text-align: center;">
            Este es un mensaje automático. ${appName} © ${new Date().getFullYear()}.
          </p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: `${appName} <${EMAIL_FROM}>`,
        to: user.email,
        subject: userEmailSubject,
        html: userEmailHtmlBody,
      });
      console.log(
        `Correo de confirmación de acceso enviado a: ${user.email} para el curso ${course.title}`
      );
    } catch (error) {
      console.error(
        `Error al enviar correo de confirmación a ${user.email}:`,
        error
      );
    }
  }

  // --- Email para el Administrador ---
  // Se mantiene la lógica actual, solo se mejora el asunto si es manual
  const currentUser = await getCurrentUser();
  const adminEmail = currentUser?.email;

  try {
    // Buscar si ya tenía acceso
    let yaTeniaAcceso = false;
    try {
      const existing = await db.purchase.findFirst({
        where: { userId: user.id, courseId: course.id },
      });
      yaTeniaAcceso = !!existing && existing.createdAt < new Date();
    } catch (error) {
      console.error('Error checking existing purchase:', error);
    }
    // Buscar detalles de pago si existen
    let paymentDetails = "No disponible";
    try {
      const payment = await db.payment.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (payment) {
        paymentDetails = `Monto: $${payment.amount} USD<br>Estado: ${payment.status}<br>ID Pago: ${payment.id}<br>Fecha: ${payment.createdAt.toLocaleString()}`;
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
    await resend.emails.send({
      from: `Notificaciones ${appName} <${EMAIL_FROM}>`,
      to: "",
      subject: `Nuevo inscrito: ${userName} en ${course.title}`,
      html: `<p>Hay un nuevo inscrito en el curso <b>${course.title}</b>.<br>
      <b>Nombre:</b> ${userName}<br>
      <b>Email:</b> ${user.email || "N/A"}<br>
      <b>Acceso al curso:</b> ${yaTeniaAcceso ? "Ya tenía acceso" : "Acceso recién otorgado"}<br>
      <b>Detalles del pago:</b><br>${paymentDetails}
      </p>`,
    });
  } catch (error) {
    console.error(
      "Error al enviar correo detallado a :",
      error
    );
  }

  if (adminEmail) {
    // Se elimina el envío del correo detallado al administrador, ya que ahora se envía un resumen a info@
    /*try {
      await resend.emails.send({
        from: `Notificaciones ${appName} <${EMAIL_FROM}>`,
        to: adminEmail,
        subject: adminEmailSubject,
        html: adminEmailHtmlBody,
      });
    } catch (error) {
      console.error(
        `Error al enviar notificación de acceso manual al administrador:`,
        error
      );
    }*/
  } else {
    console.warn(
      "No se pudo obtener el correo del administrador. No se enviará correo de notificación."
    );
  }
}

interface CourseCompletionDetails {
  user: Pick<User, "id" | "email" | "fullName" | "username">;
  course: Pick<Course, "id" | "title">;
  certificateId?: string;
}

/**
 * Envía notificación por email cuando un estudiante completa un curso.
 */
export async function sendCourseCompletionEmails({
  user,
  course,
  certificateId,
}: CourseCompletionDetails): Promise<void> {
  if (!EMAIL_FROM) {
    console.error(
      "Cannot send course completion emails: EMAIL_FROM is not configured."
    );
    return;
  }

  if (!user.email) {
    console.warn(
      `User ${user.id} does not have an email address. Skipping course completion email.`
    );
    return;
  }

  const userName = user.fullName || user.username || "Valioso Estudiante";
  const appName = APP_NAME;
  const appUrl = APP_URL;

  // --- Email para el Usuario ---
  const userEmailSubject = `¡Felicidades! Has completado el curso: ${course.title}`;
  const userEmailHtmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #2a9d8f; text-align: center;">🎉 ¡Curso Completado! 🎉</h1>
        <p>Hola ${userName},</p>
        <p>¡Felicidades! Has completado exitosamente el curso:</p>
        <div style="background-color: #f0f8f7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2a9d8f;">
          <h2 style="color: #2a9d8f; font-size: 1.2em; margin: 0;">${course.title}</h2>
        </div>
        <p>Has demostrado dedicación y compromiso al completar todos los módulos del curso. ¡Esto es un gran logro!</p>
        ${certificateId ? `
        <p style="margin-top: 20px;">Tu certificado ha sido generado automáticamente. Puedes descargarlo desde tu panel de estudiante:</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/students/my-certificates" 
             style="background-color: #2a9d8f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Ver Mi Certificado
          </a>
        </p>
        ` : `
        <p style="margin-top: 20px;">Puedes revisar tu progreso y acceder a todos los materiales del curso cuando desees:</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/courses/${course.id}" 
             style="background-color: #2a9d8f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Revisar Curso
          </a>
        </p>
        `}
        <p>Continúa explorando nuestros otros cursos para seguir ampliando tus conocimientos.</p>
        <p>¡Gracias por ser parte de ${appName} y por tu dedicación al aprendizaje!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 0.85em; color: #777; text-align: center;">
          Este es un mensaje automático. ${appName} © ${new Date().getFullYear()}.
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `${appName} <${EMAIL_FROM}>`,
      to: user.email,
      subject: userEmailSubject,
      html: userEmailHtmlBody,
    });
    console.log(
      `Correo de finalización de curso enviado a: ${user.email} para el curso ${course.title}`
    );
  } catch (error) {
    console.error(
      `Error al enviar correo de finalización a ${user.email}:`,
      error
    );
  }

  // --- Email para el Administrador () ---
  try {
    await resend.emails.send({
      from: `Notificaciones ${appName} <${EMAIL_FROM}>`,
      to: "",
      subject: `Curso completado: ${userName} finalizó ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2a9d8f;">Curso Completado</h2>
          <p>Un estudiante ha completado exitosamente un curso:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Estudiante:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Curso:</strong> ${course.title}</li>
              <li><strong>Fecha de finalización:</strong> ${new Date().toLocaleString()}</li>
              ${certificateId ? `<li><strong>Certificado generado:</strong> Sí (ID: ${certificateId})</li>` : `<li><strong>Certificado generado:</strong> No</li>`}
            </ul>
          </div>
          <p style="margin-top: 15px; color: #666; font-size: 0.9em;">
            Este es un mensaje automático generado cuando un estudiante completa todos los módulos de un curso.
          </p>
        </div>
      `,
    });
    console.log(
      `Notificación de finalización enviada a  para el curso ${course.title} completado por ${userName}`
    );
  } catch (error) {
    console.error(
      "Error al enviar notificación de finalización a :",
      error
    );
  }
}
