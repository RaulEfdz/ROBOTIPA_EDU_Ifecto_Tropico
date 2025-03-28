"use client";
import { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    router.push("/");
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulCreation(true);
      setError("");
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage);
      setError(err.errors[0].longMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result?.status === "needs_second_factor") {
        setSecondFactor(true);
        setError("");
      } else if (result?.status === "complete") {
        setActive({ session: result.createdSessionId });
        setError("");
      } else {
      }
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage);
      setError(err.errors[0].longMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 50 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Restablece tu contraseña ingresando tu correo electrónico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form
              onSubmit={!successfulCreation ? create : reset}
              className="space-y-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {!successfulCreation ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!email || isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Loader className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      "Enviar código de restablecimiento"
                    )}
                  </Button>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Código enviado a tu correo electrónico
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Código de verificación"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!password || !code || isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Loader className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      "Restablecer contraseña"
                    )}
                  </Button>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
              {secondFactor && (
                <Alert>
                  <AlertDescription>
                    2FA es requerido. Este UI no lo maneja aún.
                  </AlertDescription>
                </Alert>
              )}
            </motion.form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-gray-500">
              ¿Recordaste tu contraseña?{" "}
              <a className="text-primary hover:underline" href="/sign-in">
                Inicia sesión aquí
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
