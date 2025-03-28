'use client';

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SignupForm from "./SignupForm";
import VerifyForm from "./VerifyForm";
import { SignUpDataType } from "@/utils/types";
import { fetchData } from "@/app/(dashboard)/(routes)/teacher/courses/custom/fetchData";

// Constantes globales
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

// Función para manejar reintentos con backoff exponencial
const retryWithBackoff = async (
  operation: () => Promise<any>,
  setError: (error: string) => void,
  maxRetries: number = MAX_RETRIES
) => {
  let retries = 0;
  let delay = INITIAL_DELAY;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (err: any) {
      if (err.message === "Too many requests. Please try again in a bit.") {
        retries++;
        if (retries >= maxRetries) {
          setError("Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.");
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        setError(err.errors?.[0]?.message || "Error durante la operación. Por favor, intenta de nuevo.");
        throw err;
      }
    }
  }
};

// Componente principal de registro
const Signup = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [clerkError, setClerkError] = useState<string>("");
  const [signUpData, setSignUpData] = useState<SignUpDataType | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const signUpWithEmail = async (signUpData: SignUpDataType) => {
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await retryWithBackoff(async () => {
        setSignUpData(signUpData);

        await signUp.create({
          emailAddress: signUpData.emailAddress,
          password: signUpData.password,
        });

        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerifying(true);
      }, setClerkError);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;
  
    setIsSubmitting(true);
  
    try {
      await retryWithBackoff(async () => {
        const completeSignUp = await signUp.attemptVerification({
          strategy: 'email_code',
          code,
        });
  
        if (completeSignUp.status === "complete") {
          await setActive({ session: completeSignUp.createdSessionId });
  
          if (signUpData) {
            await setDataDB(
              {
                emailAddress: signUpData.emailAddress,
                emailVerified: true,
                id: completeSignUp.createdUserId,
                deviceType: navigator.userAgent.toLowerCase(),
              },
              (response) => {
                if (response.success) {
                  router.push("/auth");
                } else {
                  setClerkError("Error al guardar los datos en la base de datos. Por favor, intenta de nuevo.");
                }
              }
            );
          } else {
            router.push("/auth"); // fallback si no hay signUpData
          }
        } else {
          setClerkError("Verificación incompleta. Por favor, intenta de nuevo.");
        }
      }, (errorMsg: string) => {
        if (errorMsg.includes("already been verified")) {
          // Redirige directamente si ya está verificado
          router.push("/sign-in");
        } else {
          setClerkError(errorMsg);
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("already been verified")) {
        router.push("/sign-in");
      } else {
        setClerkError("Ocurrió un error al verificar. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const setDataDB = async (
    data: {
      emailAddress: string;
      emailVerified: boolean | null;
      id: string | null;
      deviceType: string | null;
    },
    callback: (response: any) => void
  ) => {
    const path = `api/auth/signUp`;
    await fetchData({
      path,
      method: "POST",
      values: data,
      callback,
      finallyFunction: () => setSignUpData(null),
    });
  };

  return (
    <div className="bg-[#C8E065]0 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 max-w-screen-lg mx-auto">

      {!verifying ? (
        <SignupForm
          signUpWithEmail={signUpWithEmail}
          clerkError={clerkError}
          isSubmitting={isSubmitting}
        />
      ) : (
        <VerifyForm
          handleVerify={handleVerify}
          code={code}
          setCode={setCode}
          isSubmitting={isSubmitting}
        />
      )}

      {clerkError && <p className="text-red-500 mt-4">{clerkError}</p>}
    </div>
  );
};

export default Signup;
