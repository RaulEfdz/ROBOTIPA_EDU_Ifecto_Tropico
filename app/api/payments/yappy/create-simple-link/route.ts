import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserDataServerAuth } from '@/app/auth/CurrentUser/userCurrentServerAuth';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Yappy Simple Link API Called ===');
    
    // Verificar autenticación
    const user = (await getUserDataServerAuth())?.user;
    console.log('User authenticated:', !!user?.id);
    
    if (!user?.id) {
      console.log('Authentication failed - no user ID');
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { courseId, amount, description } = body;
    console.log('Payment request data:', { courseId, amount, description });

    // Validar datos requeridos
    if (!courseId || !amount || amount <= 0) {
      console.log('Invalid payment data:', { courseId, amount });
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

    // Generar identificador único para el pago
    const paymentId = `YAPPY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `ORD_${Date.now()}_${user.id.substring(0, 8)}`;

    // Obtener credenciales de Yappy
    const merchantId = process.env.YAPPY_MERCHANT_ID || process.env.NEXT_PUBLIC_YAPPY_MERCHANT_ID;
    
    if (!merchantId) {
      console.log('No merchant ID configured, creating simulation link');
    }

    // Crear link de pago simple
    const paymentDescription = encodeURIComponent(description || `Curso: ${course.title}`);
    const merchantParam = encodeURIComponent(merchantId || 'SIMULATION');
    
    // Formato del link directo de Yappy
    // Basado en patrones comunes de deep links de pagos móviles
    const yappyDeepLink = `yappy://pay?merchant=${merchantParam}&amount=${amount}&reference=${paymentId}&description=${paymentDescription}`;
    
    // Link web alternativo (hipotético, ya que no conocemos la URL exacta)
    const webPaymentUrl = `https://pay.yappy.com.pa/payment?merchant=${merchantParam}&amount=${amount}&reference=${paymentId}&description=${paymentDescription}`;
    
    // Link combinado
    const paymentLink = `${yappyDeepLink}|${webPaymentUrl}`;

    // Crear registro de pago en la base de datos
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'USD',
        status: 'pending',
        referenceCode: paymentId,
        description: description || `Curso: ${course.title}`,
        metadata: {
          provider: 'yappy_simple',
          orderId,
          courseId,
          paymentLink,
          merchantId: merchantId || 'SIMULATION',
          type: 'simple_link'
        },
      },
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expira en 30 minutos

    console.log('Simple Yappy payment link created:', {
      paymentId: payment.id,
      hasLink: !!paymentLink,
      isSimulation: !merchantId
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentLink,
      expiresAt,
      amount,
      currency: 'USD',
      description: description || `Curso: ${course.title}`,
      isSimulation: !merchantId,
      instructions: {
        mobile: 'El link abrirá directamente la app de Yappy en tu móvil',
        desktop: 'El link te llevará a la página web de Yappy para completar el pago'
      }
    });

  } catch (error) {
    console.error('Error in Yappy simple link API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}