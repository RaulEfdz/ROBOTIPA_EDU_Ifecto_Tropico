"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface SignupFormProps {
  onSignupSuccess?: () => void;
  setEmail: (email: string) => void;
  config: {
    fullNamePlaceholder: string;
    usernamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    createButtonText: string;
    defaultRoleId: string; // ✅ agregar esto
  };
  
  styles: {
    backgrounds: {
      panel: string;
    };
    texts: {
      primary: string;
      secondary: string;
    };
    buttons: {
      primary: string;
      primaryText: string;
    };
  };
}

interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSignupSuccess,
  setEmail,
  config,
  styles,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",
    customRole: config.defaultRoleId ?? "", // renombrado a customRole
  });
  

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: "",
    color: "bg-gray-200",
  });

  const supabase = createClient();

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
      feedback: feedback.length
        ? `Falta: ${feedback.join(", ")}`
        : "Contraseña fuerte",
      color: colors[score as keyof typeof colors],
    };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") validateEmail(value);
    if (name === "password") {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!emailValid) {
      toast.error("Correo inválido", {
        description: "Ingresa un correo electrónico válido.",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 4) {
      toast.error("Contraseña débil", {
        description:
          "Debe contener mayúscula, minúscula, número, carácter especial y 8+ caracteres.",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.fullName || !formData.username) {
      toast.error("Todos los campos son obligatorios");
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
            custom_role: formData.customRole,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          toast.error("Cuenta existente", {
            description: "Ya existe una cuenta con este correo electrónico.",
          });
        } else {
          toast.error("Error al registrarse", {
            description: signUpError.message,
          });
        }
      } else {
        toast.success("Registro exitoso", {
          description: "Verifica tu correo para activar la cuenta.",
        });
        setEmail(formData.email);
        if (onSignupSuccess) onSignupSuccess();
      }
    } catch (error) {
      toast.error("Error inesperado", {
        description:
          error instanceof Error ? error.message : "Error desconocido.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg border-0"
      style={{ backgroundColor: styles.backgrounds.panel }}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center" style={{ color: styles.texts.primary }}>
          { "Crear Cuenta"}
        </CardTitle>
        <p className="text-sm text-center" style={{ color: styles.texts.secondary }}>
          Completa los campos para registrarte
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            name="fullName"
            placeholder={config.fullNamePlaceholder}
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          <Input
            name="username"
            placeholder={config.usernamePlaceholder}
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder={config.emailPlaceholder}
            value={formData.email}
            onChange={handleInputChange}
            required
            className={emailValid === false ? "border-red-500" : ""}
          />
          {emailValid === false && (
            <p className="text-xs text-red-500">Correo electrónico no válido</p>
          )}

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={config.passwordPlaceholder}
              value={formData.password}
              onChange={handleInputChange}
              required
              className="pr-10"
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

          <Input
            name="confirmPassword"
            type="password"
            placeholder={config.confirmPasswordPlaceholder}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />

          <Button
            type="submit"
            className="w-full font-semibold h-11"
            disabled={isLoading}
            style={{
              backgroundColor: styles.buttons.primary,
              color: styles.buttons.primaryText,
            }}
          >
            {isLoading ? "Registrando..." : config.createButtonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
