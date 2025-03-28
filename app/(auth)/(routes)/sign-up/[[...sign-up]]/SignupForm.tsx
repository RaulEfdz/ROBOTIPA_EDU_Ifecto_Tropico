"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ClipboardCopy, RefreshCw, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { generatePassword } from '@/utils/generatePassword';
import toast from 'react-hot-toast';
import { ClerkErrorDetail } from '../../types';
import { useRouter } from 'next/navigation';

export interface SignUpData {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}

const SignupForm = ({ signUpWithEmail, clerkError }: any) => {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<SignUpData>();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showGeneratedTooltip, setShowGeneratedTooltip] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptchaOnly, setShowCaptchaOnly] = useState(false);

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const emailAddress = watch('emailAddress');

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword && password !== '' && password !== undefined);
  }, [password, confirmPassword]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(emailAddress || ''));
  }, [emailAddress]);

  useEffect(() => {
    if (password) {
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasNonalphas = /\W/.test(password);
      setIsPasswordStrong(hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas);
    } else {
      setIsPasswordStrong(false);
    }
  }, [password]);

  const onSubmit = async (data: SignUpData) => {
    if (data.password !== data.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setShowCaptchaOnly(true);
    setIsLoading(true);
    try {
      await signUpWithEmail(data);
    } catch (error: any) {
      const listErr = error.errors;
    
      const alreadyVerifiedError = listErr.find(
        (err: ClerkErrorDetail) => err.code === "verification_already_verified"
      );
    
      if (alreadyVerifiedError) {
        toast.success("Ya habías verificado tu cuenta. Redirigiendo al inicio de sesión...");
        router.push("/sign-in");
        return;
      }
    
      listErr.forEach((err: ClerkErrorDetail) => {
        toast.error(err.message);
      });
    
      setShowCaptchaOnly(false);
    }
     finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setValue('password', newPassword);
    setValue('confirmPassword', newPassword);
    setShowPassword(false);
    setShowGeneratedTooltip(true);
    setTimeout(() => setShowGeneratedTooltip(false), 2000);
  };

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        {showCaptchaOnly ? (
          <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
            <div id="clerk-captcha" className="my-4" />
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin w-4 h-4" />
                Verificando...
              </div>
            )}
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <Image src="/logo-h-100.png" width={200} height={200} alt="Logo" />
              </div>
              <CardTitle>Crear una cuenta</CardTitle>
              <CardDescription>
                Únete a nuestra aplicación, crea una cuenta y disfruta de la experiencia.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Input
                      id="emailAddress"
                      type="email"
                      placeholder="Correo electrónico"
                      {...register('emailAddress', { required: 'Correo electrónico es requerido' })}
                      disabled={isLoading}
                    />
                    {emailAddress && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isEmailValid ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                  {errors.emailAddress && <span className="text-red-500 text-sm">{errors.emailAddress.message}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-grow">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        {...register('password', { required: 'Contraseña es requerida' })}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {password && (
                        <span className="absolute inset-y-0 right-8 flex items-center pr-3">
                          {isPasswordStrong ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip open={showGeneratedTooltip}>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="outline" size="icon" onClick={handleGeneratePassword} disabled={isLoading}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contraseña generada</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip open={copiedPassword}>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="outline" size="icon" onClick={copyPassword} disabled={isLoading}>
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedPassword ? "¡Copiado!" : "Copiar contraseña"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                  {password && !isPasswordStrong && (
                    <span className="text-sm text-red-500">
                      La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirma tu contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirma tu contraseña"
                      {...register('confirmPassword', {
                        required: 'Por favor, confirma tu contraseña',
                        validate: (val: string) => {
                          if (watch('password') != val) {
                            return "Las contraseñas no coinciden";
                          }
                        },
                      })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                  {password && confirmPassword && (
                    <span className={`text-sm ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                    </span>
                  )}
                </div>

                {clerkError && (
                  <Alert variant="destructive">
                    <AlertDescription>{clerkError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isEmailValid || !passwordsMatch || !isPasswordStrong || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-500">
                ¿Ya tienes una cuenta?{' '}
                <Link className="text-primary hover:underline" href="/sign-in">
                  Iniciar Sesión
                </Link>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default SignupForm;
