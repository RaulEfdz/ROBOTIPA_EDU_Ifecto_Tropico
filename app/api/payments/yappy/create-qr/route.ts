// app/api/payments/yappy/create-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { yappyService } from '@/lib/yappy/yappy-service';
import { qrGenerator } from '@/lib/yappy/qr-generator';
import { db } from '@/lib/db';
import { getUserDataServerAuth } from '@/app/auth/CurrentUser/userCurrentServerAuth';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { courseId, amount, description } = body;

    // Validar datos requeridos
    if (!courseId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Datos de pago inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el curso existe
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario no ya tenga acceso al curso
    const existingPurchase = await db.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Ya tienes acceso a este curso' },
        { status: 400 }
      );
    }

    // Generar orden única
    const orderId = `ORD_${Date.now()}_${user.id.substring(0, 8)}`;

    // Obtener usuario completo de la base de datos
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { fullName: true, username: true, email: true },
    });

    // Crear solicitud de pago en Yappy
    const paymentRequest = await yappyService.createPaymentRequest({
      amount,
      currency: 'USD',
      description: description || `Curso: ${course.title}`,
      orderId,
      customerEmail: user.email || dbUser?.email || undefined,
      customerName: dbUser?.fullName || dbUser?.username || undefined,
    });

    if (!paymentRequest.success) {
      return NextResponse.json(
        { error: 'Error al crear solicitud de pago Yappy' },
        { status: 500 }
      );
    }

    // Generar código QR
    const qrCodeImage = await qrGenerator.generateYappyQR(paymentRequest.qrData);

    // Crear registro de pago en la base de datos
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'USD',
        status: 'pending',
        referenceCode: paymentRequest.paymentId,
        description: description || `Curso: ${course.title}`,
        metadata: {
          provider: 'yappy',
          orderId,
          courseId,
          qrData: paymentRequest.qrData,
          expiresAt: paymentRequest.expiresAt.toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      yappyPaymentId: paymentRequest.paymentId,
      qrCode: qrCodeImage,
      expiresAt: paymentRequest.expiresAt,
      amount,
      currency: 'USD',
      description: description || `Curso: ${course.title}`,
    });

  } catch (error) {
    console.error('Error in Yappy create-qr API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}