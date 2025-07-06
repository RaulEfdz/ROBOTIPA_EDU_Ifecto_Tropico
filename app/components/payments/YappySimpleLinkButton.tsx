"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Loader2, Link, CheckCircle, XCircle, Smartphone, QrCode, Copy } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface YappySimpleLinkButtonProps {
  courseId: string;
  amount: number;
  courseName: string;
  disabled?: boolean;
  className?: string;
}

interface PaymentData {
  paymentId: string;
  paymentLink: string;
  expiresAt: string;
  amount: number;
  currency: string;
  description: string;
  isSimulation?: boolean;
  instructions?: {
    mobile: string;
    desktop: string;
  };
}

export default function YappySimpleLinkButton({
  courseId,
  amount,
  courseName,
  disabled = false,
  className,
}: YappySimpleLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payments/yappy/create-simple-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          amount,
          description: `Curso: ${courseName}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear el link de pago');
      }

      const data = await response.json();
      
      if (data.success) {
        setPaymentData(data);
        setShowModal(true);
        
        if (data.isSimulation) {
          toast.info('Modo simulación - Link de prueba generado');
        }
        
        // Generar QR code
        generateQRCode(data.paymentLink);
        
        // Iniciar verificación del pago cada 5 segundos
        startPaymentVerification(data.paymentId);
      } else {
        throw new Error('Error al generar link de pago');
      }
    } catch (error) {
      console.error('Error creating Yappy payment link:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentVerification = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/yappy/verify-payment/${paymentId}`);
        const data = await response.json();
        
        if (data.success && data.status === 'completed') {
          setPaymentStatus('completed');
          clearInterval(interval);
          toast.success('¡Pago completado exitosamente!');
          
          // Redirigir al curso después de 2 segundos
          setTimeout(() => {
            window.location.href = `/courses/${courseId}`;
          }, 2000);
        } else if (data.status === 'failed') {
          setPaymentStatus('failed');
          clearInterval(interval);
          toast.error('El pago ha fallado');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    }, 5000); // Verificar cada 5 segundos

    // Limpiar interval después de 15 minutos
    setTimeout(() => {
      clearInterval(interval);
    }, 15 * 60 * 1000);
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const generateQRCode = async (paymentLink: string) => {
    try {
      // Para el QR, usar el link web (después del |)
      const webLink = paymentLink.includes('|') ? paymentLink.split('|')[1] : paymentLink;
      const qrDataURL = await QRCode.toDataURL(webLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handlePaymentLink = () => {
    if (paymentData?.paymentLink) {
      const [deepLink, webLink] = paymentData.paymentLink.split('|');
      
      if (isMobileDevice()) {
        // En móvil, intentar abrir el deep link de Yappy
        try {
          window.location.href = deepLink;
          toast.info('Abriendo app de Yappy...');
        } catch (error) {
          // Si el deep link falla, abrir el web link
          window.open(webLink, '_blank');
          toast.info('Abriendo Yappy en navegador...');
        }
      } else {
        // En escritorio, abrir el link web
        window.open(webLink, '_blank');
        toast.info('Abriendo página de Yappy...');
      }
    }
  };

  const copyPaymentLink = () => {
    if (paymentData?.paymentLink) {
      const webLink = paymentData.paymentLink.includes('|') ? 
        paymentData.paymentLink.split('|')[1] : paymentData.paymentLink;
      navigator.clipboard.writeText(webLink);
      toast.success('Link copiado al portapapeles');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPaymentData(null);
    setPaymentStatus('pending');
    setQrCodeUrl('');
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Smartphone className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'completed':
        return '¡Pago completado! Redirigiendo al curso...';
      case 'failed':
        return 'El pago ha fallado. Por favor, intenta nuevamente.';
      default:
        return 'Haz clic en el botón para abrir Yappy y completar tu pago';
    }
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        variant="outline"
        className={`border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generando link...
          </>
        ) : (
          <>
            <Image 
              src="/yappy.webp" 
              alt="Yappy" 
              width={20} 
              height={20} 
              className="rounded"
            />
            Pagar con Yappy ${amount}
            <Link className="h-4 w-4" />
          </>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon()}
              {paymentStatus === 'completed' ? 'Pago Completado' : 
               paymentStatus === 'failed' ? 'Pago Fallido' :
               'Pagar con Yappy'}
            </DialogTitle>
            <DialogDescription>
              {getStatusMessage()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {paymentData && paymentStatus === 'pending' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Monto: <span className="font-semibold">${paymentData.amount} {paymentData.currency}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Curso: {courseName}
                  </p>
                  {paymentData.isSimulation && (
                    <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded">
                      ⚠️ Modo simulación activo
                    </p>
                  )}
                </div>

                {/* QR Code Section */}
                {qrCodeUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-center gap-2">
                      <QrCode className="h-4 w-4" />
                      Escanea el código QR
                    </h4>
                    <Image 
                      src={qrCodeUrl} 
                      alt="QR Code for Yappy Payment" 
                      width={200} 
                      height={200}
                      className="mx-auto"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Escanea con tu teléfono para abrir Yappy
                    </p>
                  </div>
                )}

                {/* OR Divider */}
                <div className="flex items-center w-full max-w-xs">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-sm text-gray-500">O</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Payment Link Button */}
                <Button
                  onClick={handlePaymentLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-xs flex items-center gap-2 py-3"
                >
                  <Image 
                    src="/yappy.webp" 
                    alt="Yappy" 
                    width={24} 
                    height={24} 
                    className="rounded"
                  />
                  Abrir Yappy para Pagar
                  <Link className="h-5 w-5" />
                </Button>

                {/* Copy Link Button */}
                <Button
                  onClick={copyPaymentLink}
                  variant="outline"
                  className="w-full max-w-xs flex items-center gap-2 py-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar link de pago
                </Button>

                <div className="text-xs text-gray-400 text-center max-w-xs space-y-1">
                  <p><strong>📱 En móvil:</strong> El link abrirá directamente la app de Yappy en tu móvil</p>
                  <p><strong>💻 En computadora:</strong> El link te llevará a la página web de Yappy para completar el pago</p>
                  <p className="text-primary-600 font-medium">Después del pago, regresa a esta página</p>
                </div>
              </>
            )}

            {paymentStatus === 'completed' && (
              <div className="text-center">
                <p className="text-green-600 font-semibold">¡Pago exitoso!</p>
                <p className="text-sm text-gray-600">
                  Ya tienes acceso al curso &quot;{courseName}&quot;
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center space-y-2">
                <Button 
                  onClick={() => {
                    closeModal();
                    handlePayment();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Intentar Nuevamente
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}