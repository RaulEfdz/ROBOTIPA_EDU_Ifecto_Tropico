// app/api/payments/yappy/ipn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEnrollmentConfirmationEmails } from '@/lib/email-service';
import { getStudentId, getVisitorId } from '@/utils/roles/translate';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Yappy IPN Received ===');
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const hash = searchParams.get('hash');
    const domain = searchParams.get('domain');
    const confirmationNumber = searchParams.get('confirmationNumber');

    console.log('IPN params:', { orderId, status, hash, domain, confirmationNumber });

    if (!orderId || !status || !hash || !domain) {
      console.error('Missing required IPN parameters');
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Buscar el pago en la base de datos
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { id: orderId },
          { referenceCode: orderId }
        ]
      },
      include: {
        user: true
      }
    });

    if (!payment) {
      console.error('Payment not found for orderId:', orderId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('Found payment:', payment.id);

    // Validar hash
    const secretKey = process.env.YAPPY_SECRET_KEY;
    if (!secretKey) {
      console.error('YAPPY_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Secret key not configured' }, { status: 500 });
    }

    // Decodificar la clave secreta
    const values = Buffer.from(secretKey, 'base64').toString('utf-8');
    const secrete = values.split('.');

    // Generar signature para validar
    const signature = crypto.createHmac('sha256', secrete[0])
                            .update(orderId + status + domain)
                            .digest('hex');

    const isValidHash = hash === signature;
    
    console.log('Hash validation:', { isValidHash, receivedHash: hash, calculatedHash: signature });

    if (!isValidHash) {
      console.error('Invalid hash signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Procesar según el estado
    let paymentStatus: string;
    let isSuccessful = false;

    switch (status) {
      case 'E': // Ejecutado
        paymentStatus = 'completed';
        isSuccessful = true;
        break;
      case 'R': // Rechazado
        paymentStatus = 'failed';
        break;
      case 'C': // Cancelado
        paymentStatus = 'cancelled';
        break;
      case 'X': // Expirado
        paymentStatus = 'expired';
        break;
      default:
        paymentStatus = 'failed';
    }

    console.log('Payment status:', status, 'Mapped to:', paymentStatus, 'Is successful:', isSuccessful);

    // Extraer courseId del metadata
    const courseId = payment.metadata?.courseId as string;
    if (!courseId) {
      console.error('CourseId not found in payment metadata');
      return NextResponse.json({ error: 'CourseId not found' }, { status: 400 });
    }

    // Verificar si ya fue procesado
    const existingPurchase = await db.purchase.findFirst({
      where: {
        userId: payment.userId,
        courseId: courseId,
      },
    });

    if (existingPurchase && isSuccessful) {
      console.log('Purchase already exists, skipping processing');
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Actualizar en transacción atómica
    await db.$transaction(async (prisma) => {
      // Actualizar el estado del pago
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          metadata: {
            ...payment.metadata,
            ipnData: {
              orderId,
              status,
              domain,
              confirmationNumber,
              processedAt: new Date().toISOString(),
            }
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
              purchaseId: purchase.id,
              transactionDetails: `Pago completado vía Yappy - Orden: ${orderId}${confirmationNumber ? ` - Confirmación: ${confirmationNumber}` : ''}`,
            });
            console.log('Confirmation emails sent successfully');
          } catch (emailError) {
            console.error('Error sending confirmation emails:', emailError);
            // No fallar la transacción por errores de email
          }
        }
      }
    });

    console.log('IPN processing completed successfully');
    return NextResponse.json({ 
      success: true,
      confirmation: confirmationNumber 
    });

  } catch (error) {
    console.error('Error processing Yappy IPN:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}