// lib/yappy/yappy-service.ts
// Servicio para integración con Yappy - Nueva API 2024

interface YappyPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  discount?: number;
  taxes?: number;
  subtotal?: number;
  aliasYappy?: string;
}

interface YappyPaymentResponse {
  success: boolean;
  paymentId: string;
  qrData: string;
  paymentLink: string;
  expiresAt: Date;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  message?: string;
  transactionId?: string;
  token?: string;
  documentName?: string;
}

interface YappyPaymentStatus {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  amount?: number;
  transactionId?: string;
  completedAt?: Date;
}

// Interfaces para la nueva API de Yappy
interface YappyValidateMerchantRequest {
  merchantId: string;
  urlDomain: string;
}

interface YappyValidateMerchantResponse {
  status: {
    code: string;
    description: string;
  };
  body: {
    epochTime: number;
    token: string;
  };
}

interface YappyCreateOrderRequest {
  merchantId: string;
  orderId: string;
  domain: string;
  paymentDate: number;
  aliasYappy?: string;
  ipnUrl: string;
  discount: string;
  taxes: string;
  subtotal: string;
  total: string;
}

interface YappyCreateOrderResponse {
  status: {
    code: string;
    description: string;
  };
  body: {
    transactionId: string;
    token: string;
    documentName: string;
  };
}

class YappyService {
  private apiUrl: string;
  private merchantId: string;
  private urlDomain: string;
  private ipnUrl: string;
  private environment: string;
  private isAvailable: boolean;

  constructor() {
    this.environment = process.env.YAPPY_ENVIRONMENT || 'test';
    this.isAvailable = process.env.YAPPY_AVAILABLE === 'true' || process.env.NEXT_PUBLIC_YAPPY_AVAILABLE === 'true';
    this.apiUrl = this.environment === 'prod' 
      ? process.env.YAPPY_API_URL_PROD || 'https://apipagosbg.bgeneral.cloud'
      : process.env.YAPPY_API_URL_TEST || 'https://api-comecom-uat.yappycloud.com';
    
    this.merchantId = process.env.YAPPY_MERCHANT_ID || process.env.NEXT_PUBLIC_YAPPY_MERCHANT_ID || '';
    this.urlDomain = process.env.YAPPY_URL_DOMAIN || 'https://academy.infectotropico.com';
    this.ipnUrl = process.env.YAPPY_IPN_URL || 'https://academy.infectotropico.com/api/payments/yappy/webhook';

    console.log('Yappy Service Configuration:', {
      environment: this.environment,
      isAvailable: this.isAvailable,
      apiUrl: this.apiUrl,
      hasMerchantId: !!this.merchantId,
      merchantId: this.merchantId ? `${this.merchantId.substring(0, 8)}...` : 'not set',
      urlDomain: this.urlDomain
    });

    if (!this.merchantId) {
      console.warn('Yappy credentials not configured. Set YAPPY_MERCHANT_ID or NEXT_PUBLIC_YAPPY_MERCHANT_ID');
    }
  }

  /**
   * Paso 1: Validar merchant y obtener token
   */
  private async validateMerchant(): Promise<string> {
    try {
      console.log('Validating Yappy merchant...', {
        apiUrl: `${this.apiUrl}/payments/validate/merchant`,
        merchantId: this.merchantId ? `${this.merchantId.substring(0, 8)}...` : 'not set',
        urlDomain: this.urlDomain
      });

      const response = await fetch(`${this.apiUrl}/payments/validate/merchant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: this.merchantId,
          urlDomain: this.urlDomain,
        }),
      });

      console.log('Yappy validate merchant response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Yappy validate merchant error response:', errorText);
        throw new Error(`Yappy validate merchant error: ${response.status} - ${errorText}`);
      }

      const data: YappyValidateMerchantResponse = await response.json();
      console.log('Yappy validate merchant response:', {
        statusCode: data.status?.code,
        statusDescription: data.status?.description,
        hasToken: !!data.body?.token
      });
      
      if (!data.body?.token) {
        throw new Error('No token received from Yappy validation');
      }

      return data.body.token;
    } catch (error) {
      console.error('Error validating Yappy merchant:', error);
      throw error;
    }
  }

  /**
   * Paso 2: Crear orden de pago
   */
  private async createOrder(token: string, request: YappyPaymentRequest): Promise<YappyCreateOrderResponse> {
    try {
      const paymentDate = Math.floor(Date.now() / 1000); // Epoch time
      
      const response = await fetch(`${this.apiUrl}/payments/payment-wc`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: this.merchantId,
          orderId: request.orderId,
          domain: this.urlDomain,
          paymentDate,
          aliasYappy: request.aliasYappy || '',
          ipnUrl: this.ipnUrl,
          discount: (request.discount || 0).toFixed(2),
          taxes: (request.taxes || 0).toFixed(2),
          subtotal: (request.subtotal || request.amount).toFixed(2),
          total: request.amount.toFixed(2),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Yappy create order error response:', errorText);
        throw new Error(`Yappy create order error: ${response.status} - ${errorText}`);
      }

      const data: YappyCreateOrderResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Yappy order:', error);
      throw error;
    }
  }

  /**
   * Crea una solicitud de pago Yappy y genera los datos para el QR
   */
  async createPaymentRequest(request: YappyPaymentRequest): Promise<YappyPaymentResponse> {
    try {
      // Validar que tenemos las credenciales necesarias
      if (!this.merchantId) {
        console.log('No merchant ID found, falling back to simulation mode');
        return this.createSimulatedPayment(request);
      }

      // Paso 1: Validar merchant y obtener token
      const token = await this.validateMerchant();

      // Paso 2: Crear orden
      const orderResponse = await this.createOrder(token, request);

      if (!orderResponse.body?.transactionId) {
        throw new Error('No transaction ID received from Yappy');
      }

      // Generar datos para el QR
      const qrData = this.generateQRData({
        transactionId: orderResponse.body.transactionId,
        amount: request.amount,
        merchantId: this.merchantId,
        orderId: request.orderId,
        description: request.description,
        documentName: orderResponse.body.documentName,
      });

      // Generar link de pago
      const paymentLink = this.generatePaymentLink({
        transactionId: orderResponse.body.transactionId,
        amount: request.amount,
        merchantId: this.merchantId,
        orderId: request.orderId,
        description: request.description,
      });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira en 15 minutos

      return {
        success: true,
        paymentId: orderResponse.body.transactionId,
        qrData,
        paymentLink,
        expiresAt,
        status: 'pending',
        message: 'Payment request created successfully',
        transactionId: orderResponse.body.transactionId,
        token: orderResponse.body.token,
        documentName: orderResponse.body.documentName,
      };

    } catch (error) {
      console.error('Error creating Yappy payment request:', error);
      
      // Fallback a modo simulación si hay error de configuración
      if (error instanceof Error && error.message.includes('YAPPY_MERCHANT_ID')) {
        console.warn('Falling back to simulation mode due to missing credentials');
        return this.createSimulatedPayment(request);
      }

      return {
        success: false,
        paymentId: '',
        qrData: '',
        paymentLink: '',
        expiresAt: new Date(),
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Modo simulación para desarrollo
   */
  private createSimulatedPayment(request: YappyPaymentRequest): YappyPaymentResponse {
    const paymentId = `YAP_SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const qrData = this.generateQRData({
      transactionId: paymentId,
      amount: request.amount,
      merchantId: 'SIMULATION',
      orderId: request.orderId,
      description: request.description,
      documentName: 'simulation-doc',
    });

    const paymentLink = this.generatePaymentLink({
      transactionId: paymentId,
      amount: request.amount,
      merchantId: 'SIMULATION',
      orderId: request.orderId,
      description: request.description,
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      success: true,
      paymentId,
      qrData,
      paymentLink,
      expiresAt,
      status: 'pending',
      message: 'Simulation payment created (configure YAPPY_MERCHANT_ID for production)',
    };
  }

  /**
   * Verifica el estado de un pago Yappy
   */
  async checkPaymentStatus(paymentId: string): Promise<YappyPaymentStatus> {
    try {
      // Si es simulación, usar lógica de prueba
      if (paymentId.includes('YAP_SIM_')) {
        const isCompleted = Math.random() > 0.7; // 30% chance de estar completado
        return {
          paymentId,
          status: isCompleted ? 'completed' : 'pending',
          amount: isCompleted ? 95 : undefined,
          transactionId: isCompleted ? `TXN_${Date.now()}` : undefined,
          completedAt: isCompleted ? new Date() : undefined,
        };
      }

      // En producción, aquí implementarías la verificación real del estado
      // La nueva API de Yappy no especifica un endpoint para verificar estado
      // Normalmente se haría vía webhook o polling a un endpoint específico
      
      return {
        paymentId,
        status: 'pending',
      };

    } catch (error) {
      console.error('Error checking Yappy payment status:', error);
      return {
        paymentId,
        status: 'failed',
      };
    }
  }

  /**
   * Genera los datos para el código QR de Yappy
   */
  private generateQRData(params: {
    transactionId: string;
    amount: number;
    merchantId: string;
    orderId: string;
    description: string;
    documentName: string;
  }): string {
    // Formato para el QR de Yappy
    const qrData = {
      merchant: params.merchantId,
      amount: params.amount,
      transaction_id: params.transactionId,
      order_id: params.orderId,
      description: params.description,
      document_name: params.documentName,
      timestamp: Date.now(),
    };

    return JSON.stringify(qrData);
  }

  /**
   * Genera el link de pago directo para Yappy
   */
  private generatePaymentLink(params: {
    transactionId: string;
    amount: number;
    merchantId: string;
    orderId: string;
    description: string;
  }): string {
    // Codificar parámetros para el URL
    const encodedDescription = encodeURIComponent(params.description);
    const encodedMerchant = encodeURIComponent(params.merchantId);
    
    // Formato del deep link de Yappy
    // yappy://pay?merchant={merchantId}&amount={amount}&transaction={transactionId}&order={orderId}&description={description}
    const yappyDeepLink = `yappy://pay?merchant=${encodedMerchant}&amount=${params.amount}&transaction=${params.transactionId}&order=${params.orderId}&description=${encodedDescription}`;
    
    // También generar un link universal que funcione en web
    const webPaymentUrl = `https://pay.yappycloud.com/payment?merchant=${encodedMerchant}&amount=${params.amount}&transaction=${params.transactionId}&order=${params.orderId}&description=${encodedDescription}`;
    
    // En móvil usará el deep link, en web el URL universal
    return `${yappyDeepLink}|${webPaymentUrl}`;
  }

  /**
   * Obtiene la URL del CDN según el ambiente
   */
  getCDNUrl(): string {
    return this.environment === 'prod'
      ? process.env.YAPPY_CDN_URL_PROD || 'https://bt-cdn.yappycloud.com/v1/cdn/web-component-btn-yappy.js'
      : process.env.YAPPY_CDN_URL_TEST || 'https://bt-cdn-uat.yappycloud.com/v1/cdn/web-component-btn-yappy.js';
  }

  /**
   * Verifica si Yappy está disponible
   */
  isYappyAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Valida un webhook de Yappy
   */
  validateWebhook(payload: string, signature: string): boolean {
    try {
      // Por ahora retornamos true para desarrollo
      // En producción implementar validación según especificación de Yappy
      return true;
    } catch (error) {
      console.error('Error validating Yappy webhook:', error);
      return false;
    }
  }
}

export const yappyService = new YappyService();
export type { YappyPaymentRequest, YappyPaymentResponse, YappyPaymentStatus };