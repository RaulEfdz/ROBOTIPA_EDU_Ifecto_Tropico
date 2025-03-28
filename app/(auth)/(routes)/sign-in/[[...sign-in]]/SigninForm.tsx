"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader } from "lucide-react";
import { motion } from "framer-motion";

interface SignInFormProps {
  signInWithEmail: (emailAddress: string, password: string) => Promise<void>;
  clerkError: string;
  setResetPassword: (resetPassword: boolean) => void;
}

const SigninForm = ({
  signInWithEmail,
  clerkError,
  setResetPassword,
}: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = () => {
    setResetPassword(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signInWithEmail(email, password);
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isButtonDisabled = !email || !password || isSubmitting;

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
            <div className="mb-4 flex justify-center">
              <Image src="/logo-h-100.png" width={200} height={200} alt="Logo" />
            </div>
            <CardTitle>Inicia sesión en tu cuenta</CardTitle>
            <CardDescription>
              Empieza con nuestra aplicación, solo inicia sesión y disfruta de la
              experiencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Correo electrónico"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 relative flex flex-col">
                <Label htmlFor="password">Contraseña</Label>
                <div className="flex w-full">
                  <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password.length > 0 && (
                    <Button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="right-3 text-sm bg-transparent"
                      variant="ghost"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  )}
                </div>
              </div>
              {clerkError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{clerkError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <Button
                type="submit"
                className="w-full flex justify-center items-center gap-2"
                disabled={isButtonDisabled}
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
                  "Iniciar sesión"
                )}
              </Button>
            </motion.form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-500">
              ¿No tienes una cuenta?{" "}
              <Link className="text-primary hover:underline" href="/sign-up">
                Regístrate
              </Link>
            </p>
            <Button
              variant="link"
              onClick={handleResetPassword}
              disabled={isSubmitting}
            >
              Restablecer Contraseña
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SigninForm;
