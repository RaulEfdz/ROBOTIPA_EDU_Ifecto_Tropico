import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEnrollmentConfirmationEmails } from '@/lib/email-service';
import { getStudentId, getVisitorId } from '@/utils/roles/translate';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Yappy Webhook Received ===');
    
    const body = await request.json();
    console.log('Webhook payload:', body);

    // Extraer datos del webhook de Yappy
    // El formato puede variar según la documentación de Yappy
    const {
      transactionId,
      status,
      amount,
      merchantId,
      orderId,
      reference,
      // Otros campos que Yappy pueda enviar
    } = body;

    if (!transactionId) {
      console.error('Missing transactionId in webhook');
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    // Buscar el pago en nuestra base de datos
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { referenceCode: transactionId },
          { referenceCode: reference },
          { referenceCode: orderId }
        ]
      },
      include: {
        user: true
      }
    });

    if (!payment) {
      console.error('Payment not found for transactionId:', transactionId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('Found payment:', payment.id);

    // Extraer courseId del metadata
    const courseId = payment.metadata?.courseId as string;
    if (!courseId) {
      console.error('CourseId not found in payment metadata');
      return NextResponse.json({ error: 'CourseId not found' }, { status: 400 });
    }

    // Verificar si el pago ya fue procesado
    const existingPurchase = await db.purchase.findFirst({
      where: {
        userId: payment.userId,
        courseId: courseId,
      },
    });

    if (existingPurchase) {
      console.log('Purchase already exists, skipping processing');
      return NextResponse.json({ message: 'Already processed' });
    }

    // Determinar si el pago fue exitoso
    // Los valores pueden variar según la documentación de Yappy
    const isSuccessful = status === 'completed' || 
                        status === 'approved' || 
                        status === 'success' ||
                        status === 'COMPLETADO' ||
                        status === 'APROBADO';

    console.log('Payment status:', status, 'Is successful:', isSuccessful);

    // Actualizar el pago en una transacción atómica
    await db.$transaction(async (prisma) => {
      // Actualizar el estado del pago
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccessful ? 'completed' : 'failed',
          metadata: {
            ...payment.metadata,
            webhookData: body,
            processedAt: new Date().toISOString(),
          }
        }
      });

      if (isSuccessful) {
        console.log('Creating purchase and updating user role...');

        // Crear el registro de Purchase
        const purchase = await prisma.purchase.create({
          data: {
            userId: payment.userId,
            courseId: courseId,
            paymentId: payment.id,
          },
        });

        console.log('Purchase created:', purchase.id);

        // Actualizar rol del usuario de visitor a student si es necesario
        const user = await prisma.user.findUnique({
          where: { id: payment.userId }
        });

        if (user && (user.customRole === getVisitorId() || !user.customRole)) {
          await prisma.user.update({
            where: { id: payment.userId },
            data: { customRole: getStudentId() },
          });
          console.log('User role updated to student');
        }

        // Obtener datos del curso para el email
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { id: true, title: true, description: true }
        });

        if (course && payment.user) {
          console.log('Sending confirmation emails...');
          
          try {
            await sendEnrollmentConfirmationEmails({
              user: payment.user,
              course: course,
              purchaseId: payment.id,
              transactionDetails: `Pago completado vía Yappy - ID: ${transactionId}`,
            });
            console.log('Confirmation emails sent successfully');
          } catch (emailError) {
            console.error('Error sending confirmation emails:', emailError);
            // No fallar la transacción por errores de email
          }
        }
      }
    });

    console.log('Webhook processing completed successfully');
    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      paymentId: payment.id,
      status: isSuccessful ? 'completed' : 'failed'
    });

  } catch (error) {
    console.error('Error processing Yappy webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// También manejar GET para verificaciones
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Yappy webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}