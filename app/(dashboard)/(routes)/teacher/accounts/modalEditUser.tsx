"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "./type";

// Type definitions permanecen igual

interface EditUserFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
  open: boolean;
}

const VALID_ROLES = [
  "student",
  "admin",
  "teacher",
  "developer",
  "visitor",
] as const;
type Role = (typeof VALID_ROLES)[number];

const EditUserForm = ({ user, onSave, onCancel, open }: EditUserFormProps) => {
  // Estados permanecen igual
  const [formData, setFormData] = useState({
    role: user.role,
    available: user.available,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Funciones permanecen igual
  const validateForm = (data: typeof formData): string => {
    if (!VALID_ROLES.includes(data.role as Role)) {
      return "Rol seleccionado no válido";
    }
    if (typeof data.available !== "boolean") {
      return "Disponibilidad debe ser un valor booleano";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = { ...user, ...formData };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onSave(updatedUser);
    } catch (error) {
      setError("Error al actualizar el usuario");
      console.error("Error al actualizar el usuario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Read-only fields permanecen igual
  const readOnlyFields = [
    { label: "Nombre Completo", value: user.fullName || "Sin especificar" },
    { label: "Email", value: user.emailAddress || "Sin especificar" },
    { label: "Teléfono", value: user.phoneNumber || "Sin especificar" },
    {
      label: "País de Residencia",
      value: user.countryOfResidence || "Sin especificar",
    },
    {
      label: "Edad",
      value: user.age ? user.age.toString() : "Sin especificar",
    },
    { label: "Género", value: user.gender || "Sin especificar" },
    { label: "Universidad", value: user.university || "Sin especificar" },
    {
      label: "Nivel Educativo",
      value: user.educationLevel || "Sin especificar",
    },
    {
      label: "Especialización",
      value: user.specializationArea || "Sin especificar",
    },
    {
      label: "Verificación de Correo",
      value: user.isEmailVerified ? "Verificado" : "No verificado",
    },
    {
      label: "Fecha de Creación",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleString()
        : "Sin especificar",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Rol y Disponibilidad del Usuario</DialogTitle>
          <p className="text-sm text-gray-500">
            Solo puedes cambiar el rol y la disponibilidad del usuario.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            {readOnlyFields.map((field, index) => (
              <div key={index} className="space-y-1.5">
                <Label className="font-bold text-black">{field.label}</Label>
                <p className="text-sm text-gray-600 font-light">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Editar Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Rol del Usuario
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value as Role }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="available" className="text-sm font-medium">
                      Estado de la Cuenta
                    </Label>
                    <p className="text-sm text-gray-500">
                      Determina si el usuario está habilitado en el sistema
                    </p>
                  </div>
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, available: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserForm;
