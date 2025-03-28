"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import SigninForm from "./SigninForm";
import ForgotPasswordPage from "../../resetPass/ResetPasswordForm";
// import ResetPasswordForm from "../../resetPass/ResetPasswordForm";

const Signin = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [clerkError, setClerkError] = useState<string>("");
  const router = useRouter();
  const [resetPassword, setResetPassword] = useState<boolean>(false);

  const signInWithEmail = async (emailAddress: string, password: string) => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setClerkError(
          "Inicio de sesión incompleto. Por favor, intente de nuevo."
        );
      }
    } catch (err: any) {
      setClerkError(
        err.errors
          ? err.errors[0].message
          : "Algo salió mal. Por favor, intente de nuevo."
      );
    }
  };

  const handleResetPassword = async (emailAddress: string) => {
    if (!isLoaded) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setClerkError("");
    } catch (err: any) {
      console.error("Error al enviar correo de restablecimiento:", err);
      setClerkError(
        err.errors
          ? err.errors[0].message
          : "Error al enviar el correo de restablecimiento."
      );
    }
  };

  return (
    <div className="bg-[#C8E065]0 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 max-w-screen-lg mx-auto w-s">
      {!resetPassword ? (
        <SigninForm
          signInWithEmail={signInWithEmail}
          clerkError={clerkError}
          setResetPassword={setResetPassword}
        />
      ) : (
        <ForgotPasswordPage
          // setResetPassword={setResetPassword}
          // handlerSendReset={handleResetPassword}
          // clerkError={clerkError}
        />
      )}
    </div>
  );
};

export default Signin;
