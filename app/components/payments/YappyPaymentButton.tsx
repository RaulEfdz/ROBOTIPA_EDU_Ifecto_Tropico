"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Loader2, QrCode, CheckCircle, XCircle, Timer } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface YappyPaymentButtonProps {
  courseId: string;
  amount: number;
  courseName: string;
  disabled?: boolean;
  className?: string;
}

interface PaymentData {
  paymentId: string;
  yappyPaymentId: string;
  qrCode: string;
  expiresAt: string;
  amount: number;
  currency: string;
  description: string;
}

export default function YappyPaymentButton({
  courseId,
  amount,
  courseName,
  disabled = false,
  className,
}: YappyPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState(0);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payments/yappy/create-qr', {
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
        throw new Error(error.error || 'Error al crear el pago');
      }

      const data = await response.json();
      
      if (data.success) {
        setPaymentData(data);
        setShowQRModal(true);
        
        // Calcular tiempo restante
        const expiresAt = new Date(data.expiresAt).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, expiresAt - now));
        
        // Iniciar verificación periódica del pago
        startPaymentVerification(data.paymentId);
        
        // Iniciar countdown timer
        startCountdownTimer();
      } else {
        throw new Error('Error al generar código QR');
      }
    } catch (error) {
      console.error('Error creating Yappy payment:', error);
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
        
        if (data.success) {
          setPaymentStatus(data.status);
          
          if (data.status === 'completed') {
            clearInterval(interval);
            toast.success('¡Pago completado exitosamente!');
            
            // Redirigir al curso después de 2 segundos
            setTimeout(() => {
              window.location.href = `/courses/${courseId}`;
            }, 2000);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            toast.error('El pago ha fallado');
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    }, 3000); // Verificar cada 3 segundos

    // Limpiar interval después de 15 minutos
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'pending') {
        setPaymentStatus('expired');
      }
    }, 15 * 60 * 1000);
  };

  const startCountdownTimer = () => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          setPaymentStatus('expired');
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const closeModal = () => {
    setShowQRModal(false);
    setPaymentData(null);
    setPaymentStatus('pending');
    setTimeLeft(0);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'expired':
        return <Timer className="h-8 w-8 text-orange-500" />;
      default:
        return <QrCode className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'completed':
        return '¡Pago completado! Redirigiendo al curso...';
      case 'failed':
        return 'El pago ha fallado. Por favor, intenta nuevamente.';
      case 'expired':
        return 'El código QR ha expirado. Genera uno nuevo.';
      default:
        return 'Escanea el código QR con tu app de Yappy para completar el pago';
    }
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando QR...
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
          </>
        )}
      </Button>

      <Dialog open={showQRModal} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon()}
              {paymentStatus === 'completed' ? 'Pago Completado' : 
               paymentStatus === 'failed' ? 'Pago Fallido' :
               paymentStatus === 'expired' ? 'Código Expirado' :
               'Pagar con Yappy'}
            </DialogTitle>
            <DialogDescription>
              {getStatusMessage()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {paymentData && paymentStatus === 'pending' && (
              <>
                <div className="flex flex-col items-center space-y-2">
                  <Image
                    src={paymentData.qrCode}
                    alt="Código QR Yappy"
                    width={250}
                    height={250}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Monto: <span className="font-semibold">${paymentData.amount} {paymentData.currency}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {paymentData.description}
                    </p>
                  </div>
                </div>

                {timeLeft > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Timer className="h-4 w-4" />
                    <span>Expira en: {formatTime(timeLeft)}</span>
                  </div>
                )}

                <div className="text-xs text-gray-400 text-center max-w-xs">
                  <p>1. Abre tu app de Yappy</p>
                  <p>2. Escanea este código QR</p>
                  <p>3. Confirma el pago</p>
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

            {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
              <div className="text-center space-y-2">
                <Button 
                  onClick={() => {
                    closeModal();
                    handlePayment();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generar Nuevo Código QR
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}