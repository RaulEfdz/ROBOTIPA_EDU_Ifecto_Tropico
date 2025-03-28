"use client"
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MailCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Mail 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface EmailConfirmationPendingProps {
  email: string;
  onSignOut?: () => void;
}

export const EmailConfirmationPending: React.FC<EmailConfirmationPendingProps> = ({ 
  email, 
  onSignOut 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [countdown, setCountdown] = useState(0);
  const supabase = createClient();

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setResendStatus('idle');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      setResendStatus('success');
      // Iniciar countdown de 60 segundos
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (onSignOut) onSignOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
    <Card className="w-[400px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Mail className="w-16 h-16 text-primary" />
            <CheckCircle2 className="w-6 h-6 text-green-500 absolute -right-1 -bottom-1" />
          </div>
        </div>
        <CardTitle className="text-center">Verifica tu Correo Electrónico</CardTitle>
        {email && (
          <CardDescription className="text-center break-all">
            Enviado a: <span className="font-medium">{email}</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Próximos pasos:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Revisa tu bandeja de entrada</li>
            <li>Busca un correo de verificación de nuestra parte</li>
            <li>Haz clic en el enlace de verificación</li>
            <li>Regresa aquí para iniciar sesión</li>
          </ol>
        </div>

        {resendStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Nuevo correo de verificación enviado exitosamente.
            </AlertDescription>
          </Alert>
        )}

        {resendStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al reenviar el correo. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResendEmail}
          disabled={isResending || countdown > 0}
        >
          {isResending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MailCheck className="mr-2 h-4 w-4" />
          )}
          {countdown > 0
            ? `Espera ${countdown}s para reenviar`
            : 'Reenviar correo de verificación'}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={handleSignOut}
        >
          Usar otro correo electrónico
        </Button>

        <div className="text-center text-sm text-muted-foreground mt-2">
          <p>
            ¿No encuentras el correo? Revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>
      </CardFooter>
    </Card>
    </div>
  );
};

export default EmailConfirmationPending;


/*Use options above to edit


alter policy "Usuarios verificados pueden seleccionar su perfil"


on "public"."users"


to authenticated


using (

7
  (((auth.jwt() ->> 'email_confirmed_at'::text) IS NOT NULL) AND (user_id = auth.uid()))

);*/