import { NextRequest, NextResponse } from 'next/server';
import { yappyService } from '@/lib/yappy/yappy-service';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      configuration: {
        isAvailable: yappyService.isYappyAvailable(),
        environment: process.env.YAPPY_ENVIRONMENT || 'test',
        hasMerchantId: !!(process.env.YAPPY_MERCHANT_ID || process.env.NEXT_PUBLIC_YAPPY_MERCHANT_ID),
        merchantIdPreview: (process.env.YAPPY_MERCHANT_ID || process.env.NEXT_PUBLIC_YAPPY_MERCHANT_ID || '').substring(0, 8) + '...',
        apiUrl: process.env.YAPPY_ENVIRONMENT === 'prod' 
          ? process.env.YAPPY_API_URL_PROD
          : process.env.YAPPY_API_URL_TEST,
        urlDomain: process.env.YAPPY_URL_DOMAIN,
        environmentVars: {
          YAPPY_AVAILABLE: process.env.YAPPY_AVAILABLE,
          NEXT_PUBLIC_YAPPY_AVAILABLE: process.env.NEXT_PUBLIC_YAPPY_AVAILABLE,
          YAPPY_ENVIRONMENT: process.env.YAPPY_ENVIRONMENT,
        }
      }
    });
  } catch (error) {
    console.error('Error testing Yappy configuration:', error);
    return NextResponse.json(
      { 
        error: 'Error testing configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}