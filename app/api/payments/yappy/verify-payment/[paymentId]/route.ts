// app/api/payments/yappy/verify-payment/[paymentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { yappyService } from '@/lib/yappy/yappy-service';
import { db } from '@/lib/db';
import { getUserDataServerAuth } from '@/app/auth/CurrentUser/userCurrentServerAuth';
import { sendEnrollmentConfirmationEmails } from '@/lib/email-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    
    // Verificar autenticación
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Buscar el pago en la base de datos
    const payment = await db.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    // Si el pago ya está completado, retornar el estado
    if (payment.status === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        paymentId: payment.id,
        amount: payment.amount,
        completedAt: payment.updatedAt,
      });
    }

    // Obtener el ID de pago de Yappy desde metadata
    const yappyPaymentId = payment.referenceCode;
    if (!yappyPaymentId) {
      return NextResponse.json(
        { error: 'ID de pago Yappy no encontrado' },
        { status: 400 }
      );
    }

    // Verificar estado en Yappy
    const yappyStatus = await yappyService.checkPaymentStatus(yappyPaymentId);

    // Actualizar estado en la base de datos
    if (yappyStatus.status === 'completed' && payment.status !== 'completed') {
      // Actualizar pago como completado
      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          metadata: {
            ...((payment.metadata as any) || {}),
            yappyTransactionId: yappyStatus.transactionId,
            completedAt: yappyStatus.completedAt?.toISOString(),
          },
        },
      });

      // Crear purchase record para dar acceso al curso
      const courseId = (payment.metadata as any)?.courseId;
      if (courseId) {
        const existingPurchase = await db.purchase.findFirst({
          where: {
            userId: user.id,
            courseId: courseId,
          },
        });

        if (!existingPurchase) {
          const purchase = await db.purchase.create({
            data: {
              userId: user.id,
              courseId: courseId,
              paymentId: payment.id,
            },
          });

          // Obtener datos del curso para el email
          const course = await db.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, price: true },
          });

          if (course) {
            // Obtener usuario completo de la base de datos
            const dbUser = await db.user.findUnique({
              where: { id: user.id },
              select: { id: true, email: true, fullName: true, username: true },
            });
            
            // Enviar email de confirmación
            try {
              if (dbUser) {
                await sendEnrollmentConfirmationEmails({
                  user: {
                    id: dbUser.id,
                    email: dbUser.email || '',
                    fullName: dbUser.fullName || '',
                    username: dbUser.username || '',
                  },
                  course,
                  purchaseId: purchase.id,
                  transactionDetails: `Pago completado vía Yappy - Transacción: ${yappyStatus.transactionId}`,
                });
              }
            } catch (emailError) {
              console.error('Error sending enrollment confirmation email:', emailError);
              // No interrumpir el flujo si falla el email
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        status: 'completed',
        paymentId: updatedPayment.id,
        amount: updatedPayment.amount,
        completedAt: yappyStatus.completedAt,
        transactionId: yappyStatus.transactionId,
      });
    }

    // El pago sigue pendiente o falló
    if (yappyStatus.status === 'failed' && payment.status !== 'failed') {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });
    }

    return NextResponse.json({
      success: true,
      status: yappyStatus.status,
      paymentId: payment.id,
      amount: payment.amount,
    });

  } catch (error) {
    console.error('Error in Yappy verify-payment API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}