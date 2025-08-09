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

// === DOCUMENT VALIDATION EMAIL NOTIFICATIONS ===

interface DocumentValidationDetails {
  user: Pick<User, "id" | "email" | "fullName" | "username">;
  fileName: string;
  fileSize: number;
  validationId: string;
}

interface DocumentApprovalDetails {
  user: Pick<User, "id" | "email" | "fullName" | "username">;
  fileName?: string;
  reviewerName: string;
  validationId: string;
}

interface DocumentRejectionDetails {
  user: Pick<User, "id" | "email" | "fullName" | "username">;
  fileName?: string;
  reviewerName: string;
  rejectionReason: string;
  validationId: string;
}

/**
 * Envía emails de confirmación cuando un usuario sube un documento para validación.
 */
export async function sendDocumentUploadEmails({
  user,
  fileName,
  fileSize,
  validationId,
}: DocumentValidationDetails): Promise<void> {
  if (!EMAIL_FROM) {
    console.error("Cannot send document upload emails: EMAIL_FROM is not configured.");
    return;
  }

  const userName = user.fullName || user.username || "Usuario";
  const appName = APP_NAME;
  const appUrl = APP_URL;
  const fileSizeFormatted = (fileSize / 1024 / 1024).toFixed(2);

  // --- Email para el Usuario ---
  if (user.email) {
    const userEmailSubject = `Documento recibido - En proceso de validación`;
    const userEmailHtmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #2a9d8f; text-align: center;">Documento Recibido</h1>
          <p>Hola ${userName},</p>
          <p>Hemos recibido tu documento de acreditación y está siendo procesado por nuestro equipo de validación.</p>
          
          <div style="background-color: #f0f8f7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2a9d8f;">
            <h2 style="color: #2a9d8f; font-size: 1.1em; margin: 0 0 10px 0;">Detalles del documento:</h2>
            <ul style="list-style-type: none; padding-left: 0; margin: 0;">
              <li><strong>Archivo:</strong> ${fileName}</li>
              <li><strong>Tamaño:</strong> ${fileSizeFormatted} MB</li>
              <li><strong>Fecha de recepción:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>ID de validación:</strong> ${validationId}</li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>¿Qué sigue?</strong><br>
              • Nuestro equipo revisará tu documento en 1-3 días hábiles<br>
              • Recibirás una notificación por email con el resultado<br>
              • Mientras tanto, el acceso a cursos permanece restringido<br>
              • Puedes revisar el estado en tu panel de validación
            </p>
          </div>

          <p style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/validation" 
               style="background-color: #2a9d8f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block;">
              Ver Estado de Validación
            </a>
          </p>

          <p>Si tienes alguna pregunta sobre el proceso de validación, no dudes en contactarnos.</p>
          <p>¡Gracias por tu paciencia!</p>
          
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
      console.log(`Correo de documento recibido enviado a: ${user.email}`);
    } catch (error) {
      console.error(`Error al enviar correo de documento recibido a ${user.email}:`, error);
    }
  }

  // --- Email para Administradores ---
  try {
    await resend.emails.send({
      from: `Notificaciones ${appName} <${EMAIL_FROM}>`,
      to: "", // Configurar email de admin
      subject: `Nuevo documento para validar: ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2a9d8f;">Nuevo Documento para Validar</h2>
          <p>Se ha recibido un nuevo documento de acreditación que requiere revisión:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Usuario:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${user.email || "N/A"}</li>
              <li><strong>Archivo:</strong> ${fileName}</li>
              <li><strong>Tamaño:</strong> ${fileSizeFormatted} MB</li>
              <li><strong>ID de validación:</strong> ${validationId}</li>
              <li><strong>Fecha de subida:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/admin/validations" 
               style="background-color: #2a9d8f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Revisar Documento
            </a>
          </p>
          
          <p style="margin-top: 15px; color: #666; font-size: 0.9em;">
            Este mensaje se genera automáticamente cuando un usuario sube un documento de validación.
          </p>
        </div>
      `,
    });
    console.log(`Notificación de nuevo documento enviada a administradores`);
  } catch (error) {
    console.error("Error al enviar notificación a administradores:", error);
  }
}

/**
 * Envía emails cuando un documento es aprobado.
 */
export async function sendDocumentApprovalEmails({
  user,
  fileName,
  reviewerName,
  validationId,
}: DocumentApprovalDetails): Promise<void> {
  if (!EMAIL_FROM) {
    console.error("Cannot send document approval emails: EMAIL_FROM is not configured.");
    return;
  }

  const userName = user.fullName || user.username || "Usuario";
  const appName = APP_NAME;
  const appUrl = APP_URL;

  // --- Email para el Usuario ---
  if (user.email) {
    const userEmailSubject = `¡Documento aprobado! Ya tienes acceso completo`;
    const userEmailHtmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #16a34a; text-align: center;">🎉 ¡Documento Aprobado! 🎉</h1>
          <p>Hola ${userName},</p>
          <p>¡Excelentes noticias! Tu documento de acreditación ha sido <strong>aprobado</strong> exitosamente.</p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #16a34a;">
            <h2 style="color: #16a34a; font-size: 1.1em; margin: 0 0 10px 0;">Detalles de la aprobación:</h2>
            <ul style="list-style-type: none; padding-left: 0; margin: 0;">
              ${fileName ? `<li><strong>Documento:</strong> ${fileName}</li>` : ""}
              <li><strong>Revisado por:</strong> ${reviewerName}</li>
              <li><strong>Fecha de aprobación:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Estado:</strong> <span style="color: #16a34a; font-weight: bold;">APROBADO</span></li>
            </ul>
          </div>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af;">
              <strong>¡Ya puedes acceder a todo!</strong><br>
              • Explora nuestro catálogo completo de cursos<br>
              • Compra y accede a cualquier curso<br>
              • Disfruta de todas las funcionalidades de la plataforma<br>
              • Descarga certificados al completar cursos
            </p>
          </div>

          <p style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/courses/catalog" 
               style="background-color: #16a34a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block;">
              Explorar Cursos
            </a>
          </p>

          <p>¡Gracias por completar el proceso de validación y bienvenido a ${appName}!</p>
          
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
      console.log(`Correo de documento aprobado enviado a: ${user.email}`);
    } catch (error) {
      console.error(`Error al enviar correo de documento aprobado a ${user.email}:`, error);
    }
  }
}

/**
 * Envía emails cuando un documento es rechazado.
 */
export async function sendDocumentRejectionEmails({
  user,
  fileName,
  reviewerName,
  rejectionReason,
  validationId,
}: DocumentRejectionDetails): Promise<void> {
  if (!EMAIL_FROM) {
    console.error("Cannot send document rejection emails: EMAIL_FROM is not configured.");
    return;
  }

  const userName = user.fullName || user.username || "Usuario";
  const appName = APP_NAME;
  const appUrl = APP_URL;

  // --- Email para el Usuario ---
  if (user.email) {
    const userEmailSubject = `Documento rechazado - Acción requerida`;
    const userEmailHtmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #dc2626; text-align: center;">Documento Rechazado</h1>
          <p>Hola ${userName},</p>
          <p>Lamentablemente, tu documento de acreditación ha sido <strong>rechazado</strong> durante el proceso de revisión.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc2626;">
            <h2 style="color: #dc2626; font-size: 1.1em; margin: 0 0 10px 0;">Detalles del rechazo:</h2>
            <ul style="list-style-type: none; padding-left: 0; margin: 0;">
              ${fileName ? `<li><strong>Documento:</strong> ${fileName}</li>` : ""}
              <li><strong>Revisado por:</strong> ${reviewerName}</li>
              <li><strong>Fecha de revisión:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          <div style="background-color: #fff1f2; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #fecaca;">
            <h3 style="color: #dc2626; font-size: 1em; margin: 0 0 10px 0;">Motivo del rechazo:</h3>
            <p style="margin: 0; color: #7f1d1d; font-style: italic;">
              "${rejectionReason}"
            </p>
          </div>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #6b7280;">
            <p style="margin: 0; color: #374151;">
              <strong>¿Qué hacer ahora?</strong><br>
              • Revisa el motivo del rechazo arriba indicado<br>
              • Corrige los problemas mencionados<br>
              • Sube un nuevo documento cuando esté listo<br>
              • El nuevo documento será revisado nuevamente
            </p>
          </div>

          <p style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/validation" 
               style="background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block;">
              Subir Nuevo Documento
            </a>
          </p>

          <p>Si tienes dudas sobre el motivo del rechazo o necesitas ayuda, no dudes en contactarnos.</p>
          <p>¡Estamos aquí para ayudarte a completar exitosamente tu validación!</p>
          
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
      console.log(`Correo de documento rechazado enviado a: ${user.email}`);
    } catch (error) {
      console.error(`Error al enviar correo de documento rechazado a ${user.email}:`, error);
    }
  }
}
