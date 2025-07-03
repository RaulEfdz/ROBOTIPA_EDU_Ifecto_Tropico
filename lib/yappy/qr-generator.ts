// lib/yappy/qr-generator.ts
// Generador de códigos QR para pagos Yappy

import QRCode from 'qrcode';

interface QRGenerationOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

class QRGenerator {
  /**
   * Genera un código QR como data URL (base64)
   */
  async generateQRCode(
    data: string, 
    options: QRGenerationOptions = {}
  ): Promise<string> {
    try {
      const qrOptions = {
        type: 'image/png' as const,
        width: options.size || 256,
        margin: options.margin || 2,
        color: {
          dark: options.color?.dark || '#000000',
          light: options.color?.light || '#FFFFFF',
        },
        errorCorrectionLevel: 'M' as const,
      };

      const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Genera un código QR específico para Yappy con branding
   */
  async generateYappyQR(
    paymentData: string,
    options: QRGenerationOptions = {}
  ): Promise<string> {
    const yappyOptions = {
      size: 300,
      margin: 3,
      color: {
        dark: '#1E40AF', // Azul de Yappy
        light: '#FFFFFF',
      },
      ...options,
    };

    return this.generateQRCode(paymentData, yappyOptions);
  }

  /**
   * Genera múltiples formatos de QR para diferentes usos
   */
  async generateMultipleFormats(data: string): Promise<{
    small: string;
    medium: string;
    large: string;
  }> {
    const [small, medium, large] = await Promise.all([
      this.generateYappyQR(data, { size: 150 }),
      this.generateYappyQR(data, { size: 300 }),
      this.generateYappyQR(data, { size: 500 }),
    ]);

    return { small, medium, large };
  }

  /**
   * Valida si los datos son apropiados para un QR
   */
  validateQRData(data: string): { isValid: boolean; reason?: string } {
    if (!data || data.trim().length === 0) {
      return { isValid: false, reason: 'Data cannot be empty' };
    }

    if (data.length > 2000) {
      return { isValid: false, reason: 'Data too long for QR code' };
    }

    return { isValid: true };
  }
}

export const qrGenerator = new QRGenerator();
export type { QRGenerationOptions };