// app/api/payments/yappy/validate-merchant/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Yappy Validate Merchant ===');
    
    const { merchantId, urlDomain } = await request.json();
    
    console.log('Received validation request:', {
      merchantId: merchantId ? `${merchantId.substring(0, 8)}...` : 'NOT_PROVIDED',
      urlDomain: urlDomain || 'NOT_PROVIDED'
    });
    
    if (!merchantId || !urlDomain) {
      console.error('Missing required fields:', { merchantId: !!merchantId, urlDomain: !!urlDomain });
      return NextResponse.json(
        { error: 'merchantId y urlDomain son requeridos' },
        { status: 400 }
      );
    }

    // Determinar el ambiente usando configuración específica de Yappy
    const yappyEnvironment = process.env.YAPPY_ENVIRONMENT || 'test';
    const baseUrl = yappyEnvironment === 'prod'
      ? process.env.YAPPY_API_URL_PROD || 'https://apipagosbg.bgeneral.cloud'
      : process.env.YAPPY_API_URL_TEST || 'https://api-comecom-uat.yappycloud.com';

    console.log('Using Yappy API:', {
      environment: yappyEnvironment,
      baseUrl,
      endpoint: `${baseUrl}/payments/validate/merchant`
    });

    const requestBody = {
      merchantId,
      urlDomain,
    };

    console.log('Sending validation request to Yappy:', requestBody);

    const response = await fetch(`${baseUrl}/payments/validate/merchant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Yappy response status:', response.status);
    
    const data = await response.json();
    
    console.log('Yappy merchant validation response:', data);

    if (!response.ok) {
      console.error('Yappy validation failed:', {
        status: response.status,
        data
      });
      return NextResponse.json(
        { error: 'Error validando comercio en Yappy', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in Yappy validate merchant API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}