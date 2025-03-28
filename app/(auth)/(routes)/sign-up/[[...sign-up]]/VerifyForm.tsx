import React, { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Logo } from "@/utils/logo";

interface VerifyFormProps {
  handleVerify: (e: FormEvent) => void;
  code: string;
  setCode: (value: string) => void;
  isSubmitting: boolean;
}

const VerifyForm: React.FC<VerifyFormProps> = ({ handleVerify, code, setCode, isSubmitting }) => {
  const isButtonDisabled = isSubmitting || code.trim().length === 0;

  return (
    <div className="flex items-center justify-center min-h-screen">

    <Card className="w-full max-w-md mx-auto ">
      <CardHeader>
        <Logo/>
        <CardTitle>Código de verificación</CardTitle>
        <CardDescription>
          Ingresa el código de verificación que se envió a tu correo electrónico. Revisa tu bandeja de entrada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Código
            </label>
            <Input
              value={code}
              id="code"
              name="code"
              placeholder="Ingresa el código"
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={isButtonDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Completar registro'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};

export default VerifyForm;
