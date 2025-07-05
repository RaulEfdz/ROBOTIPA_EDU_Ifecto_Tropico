// app/api/payments/yappy/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserDataServerAuth } from '@/app/auth/CurrentUser/userCurrentServerAuth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Yappy Create Order START ===');
    
    // Verificar autenticación
    console.log('Step 1: Getting user authentication...');
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { courseId, amount, description } = await request.json();
    
    if (!courseId || !amount) {
      return NextResponse.json(
        { error: 'courseId y amount son requeridos' },
        { status: 400 }
      );
    }

    // Obtener credenciales de Yappy
    const merchantId = process.env.YAPPY_MERCHANT_ID || process.env.NEXT_PUBLIC_YAPPY_MERCHANT_ID;
    const urlDomain = process.env.YAPPY_DOMAIN || process.env.YAPPY_URL_DOMAIN || process.env.NEXT_PUBLIC_YAPPY_DOMAIN;
    
    console.log('Yappy credentials check:', {
      merchantId: merchantId ? `${merchantId.substring(0, 8)}...` : 'NOT_SET',
      urlDomain: urlDomain || 'NOT_SET',
      env_YAPPY_MERCHANT_ID: process.env.YAPPY_MERCHANT_ID ? 'SET' : 'NOT_SET',
      env_YAPPY_DOMAIN: process.env.YAPPY_DOMAIN ? 'SET' : 'NOT_SET',
      env_YAPPY_URL_DOMAIN: process.env.YAPPY_URL_DOMAIN ? 'SET' : 'NOT_SET',
    });
    
    if (!merchantId || !urlDomain) {
      return NextResponse.json(
        { error: `Credenciales de Yappy no configuradas. MerchantId: ${merchantId ? 'OK' : 'MISSING'}, Domain: ${urlDomain ? 'OK' : 'MISSING'}` },
        { status: 500 }
      );
    }

    // Paso 1: Validar comercio y obtener token
    console.log('Step 1: Validating merchant...');
    const validateResponse = await fetch(`${request.nextUrl.origin}/api/payments/yappy/validate-merchant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantId,
        urlDomain,
      }),
    });

    if (!validateResponse.ok) {
      const error = await validateResponse.json();
      return NextResponse.json(
        { error: 'Error validando comercio', details: error },
        { status: 400 }
      );
    }

    const validationData = await validateResponse.json();
    const token = validationData.body?.token;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No se pudo obtener token de autorización' },
        { status: 400 }
      );
    }

    // Generar orderId único
    const orderId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.substring(0, 15);
    
    // Crear registro de pago en la base de datos
    const payment = await db.payment.create({
      data: {
        id: orderId,
        userId: user.id,
        amount: parseFloat(amount.toString()),
        currency: 'USD',
        status: 'pending',
        referenceCode: orderId,
        description: description || 'Pago con Yappy',
        metadata: {
          courseId,
          description,
          merchantId,
          urlDomain,
          token,
          paymentMethod: 'yappy',
        },
      },
    });

    console.log('Payment record created:', payment.id);

    // Paso 2: Crear orden en Yappy
    console.log('Step 2: Creating order in Yappy...');
    
    const yappyEnvironment = process.env.YAPPY_ENVIRONMENT || 'test';
    const baseUrl = yappyEnvironment === 'prod'
      ? process.env.YAPPY_API_URL_PROD || 'https://apipagosbg.bgeneral.cloud'
      : process.env.YAPPY_API_URL_TEST || 'https://api-comecom-uat.yappycloud.com';
    
    console.log('Using Yappy API environment:', {
      environment: yappyEnvironment,
      baseUrl,
    });

    const ipnUrl = `${request.nextUrl.origin}/api/payments/yappy/ipn`;
    
    const orderResponse = await fetch(`${baseUrl}/payments/payment-wc`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantId,
        orderId,
        domain: urlDomain,
        paymentDate: Math.floor(Date.now() / 1000), // epoch time
        aliasYappy: process.env.YAPPY_TEST_PHONE || '', // Solo para pruebas
        ipnUrl,
        discount: "0.00",
        taxes: "0.00",
        subtotal: amount.toFixed(2),
        total: amount.toFixed(2),
      }),
    });

    const orderData = await orderResponse.json();
    
    console.log('Yappy order response:', orderData);

    if (!orderResponse.ok) {
      // Eliminar el pago si la orden falla
      await db.payment.delete({ where: { id: orderId } });
      
      return NextResponse.json(
        { error: 'Error creando orden en Yappy', details: orderData },
        { status: 400 }
      );
    }

    // Actualizar payment con datos de la orden
    await db.payment.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...(payment.metadata as object || {}),
          transactionId: orderData.body?.transactionId,
          documentName: orderData.body?.documentName,
          orderToken: orderData.body?.token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: payment.id,
      body: {
        transactionId: orderData.body?.transactionId,
        token: orderData.body?.token,
        documentName: orderData.body?.documentName,
      },
    });

  } catch (error) {
    console.error('Error in Yappy create order API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'No stack') : undefined
      },
      { status: 500 }
    );
  }
}