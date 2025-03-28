"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import { AlertTriangle, CheckCircleIcon, Eye, EyeOff } from "lucide-react";

interface SignupFormProps {
  onSignupSuccess?: () => void;
  setEmail: (email: string) => void;
}

interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess, setEmail }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",
    role: "teacher", // Valor predeterminado para el rol personalizado
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: "",
    color: "bg-gray-200",
  });

  const supabase = createClient();

  // Validación de fortaleza de la contraseña
  const validatePasswordStrength = (password: string): PasswordStrength => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let score = 0;
    const feedback = [];

    if (hasUpperCase) score++;
    else feedback.push("mayúscula");
    if (hasLowerCase) score++;
    else feedback.push("minúscula");
    if (hasNumbers) score++;
    else feedback.push("número");
    if (hasSpecialChar) score++;
    else feedback.push("carácter especial");
    if (isLongEnough) score++;
    else feedback.push("mínimo 8 caracteres");

    const colors = {
      0: "bg-red-200",
      1: "bg-red-400",
      2: "bg-yellow-400",
      3: "bg-yellow-600",
      4: "bg-green-400",
      5: "bg-green-600",
    };

    return {
      score,
      feedback: feedback.length ? `Falta: ${feedback.join(", ")}` : "Contraseña fuerte",
      color: colors[score as keyof typeof colors],
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "email") {
      validateEmail(value);
    }
    if (name === "password") {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validaciones
    if (!emailValid) {
      setError("Por favor, introduce un correo electrónico válido.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 4) {
      setError("La contraseña no cumple con los requisitos mínimos de seguridad.");
      setIsLoading(false);
      return;
    }

    if (!formData.fullName || !formData.username) {
      setError("Todos los campos son obligatorios.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            custom_role: formData.role, // Se almacena el rol personalizado aquí
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setError("Ya existe una cuenta con este correo electrónico.");
        } else {
          setError(`Error al registrarse: ${signUpError.message}`);
        }
      } else {
        setSuccessMessage(
          "Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta."
        );
        setEmail(formData.email);
        if (onSignupSuccess) onSignupSuccess();
      }
    } catch (error) {
      setError(
        `Error inesperado: ${error instanceof Error ? error.message : "Desconocido"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="space-y-2">
        <CardTitle>Crear Cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Input
              name="fullName"
              placeholder="Nombre Completo"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              name="username"
              placeholder="Nombre de Usuario"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={emailValid === false ? "border-red-500" : ""}
            />
            {emailValid === false && (
              <p className="text-xs text-red-500">Correo electrónico no válido</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">{passwordStrength.feedback}</p>
          </div>
          <div className="space-y-2">
            <Input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Selector para elegir el rol personalizado */}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default">
              <CheckCircleIcon className="h-4 w-4" />
              <AlertTitle>Registro Exitoso</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </Button>
        </form>
      </CardContent>
    </>
  );
};

export default SignupForm;
