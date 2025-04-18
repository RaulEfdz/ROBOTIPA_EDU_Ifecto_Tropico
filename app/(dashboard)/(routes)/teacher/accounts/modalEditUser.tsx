"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/prisma/types";
import { getAllRoles, translateRole, isValidRole } from "@/utils/roles/translate";
import { AlertCircle, Copy, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditUserFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
  open: boolean;
  visibleColumns: Partial<Record<keyof User, boolean>>;
}

const EditUserForm = ({ user, onSave, onCancel, open, visibleColumns }: EditUserFormProps) => {
  const [formData, setFormData] = useState({
    customRole: user.customRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const validateForm = (data: typeof formData): string => {
    if (!isValidRole(data.customRole)) {
      return "Rol seleccionado no válido";
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

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const safeLength = (arr: any[] | undefined): string =>
    Array.isArray(arr) ? arr.length.toString() : "0";

  const fieldMap: Record<keyof User, { label: string; value: string; rawValue?: any }> = {
    id: { label: "ID", value: user.id, rawValue: user.id },
    email: { label: "Email", value: user.email || "Sin especificar", rawValue: user.email },
    fullName: { label: "Nombre Completo", value: user.fullName || "Sin especificar", rawValue: user.fullName },
    username: { label: "Username", value: user.username || "Sin especificar", rawValue: user.username },
    phone: { label: "Teléfono", value: user.phone || "Sin especificar", rawValue: user.phone },
    customRole: { label: "Rol Actual", value: translateRole(user.customRole), rawValue: user.customRole },
    provider: { label: "Proveedor", value: user.provider, rawValue: user.provider },
    lastSignInAt: {
      label: "Último Inicio de Sesión",
      value: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Nunca",
      rawValue: user.lastSignInAt
    },
    metadata: {
      label: "Metadata",
      value: user.metadata ? JSON.stringify(user.metadata) : "Sin datos",
      rawValue: user.metadata
    },
    isActive: { 
      label: "Estado", 
      value: user.isActive ? "Activo" : "Inactivo", 
      rawValue: user.isActive 
    },
    isBanned: { 
      label: "¿Baneado?", 
      value: user.isBanned ? "Sí" : "No", 
      rawValue: user.isBanned 
    },
    isDeleted: { 
      label: "¿Eliminado?", 
      value: user.isDeleted ? "Sí" : "No", 
      rawValue: user.isDeleted 
    },
    additionalStatus: { 
      label: "Estado Adicional", 
      value: user.additionalStatus, 
      rawValue: user.additionalStatus 
    },
    createdAt: {
      label: "Fecha de Creación",
      value: user.createdAt ? new Date(user.createdAt).toLocaleString() : "Sin especificar",
      rawValue: user.createdAt
    },
    updatedAt: {
      label: "Fecha de Actualización",
      value: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Sin especificar",
      rawValue: user.updatedAt
    },
    courses: { label: "Cursos Asignados", value: safeLength(user.courses), rawValue: user.courses },
    purchases: { label: "Compras", value: safeLength(user.purchases), rawValue: user.purchases },
    userProgress: { label: "Progreso de Usuario", value: safeLength(user.userProgress), rawValue: user.userProgress },
    invoices: { label: "Facturas", value: safeLength(user.invoices), rawValue: user.invoices },
    examAttempts: { label: "Intentos de Examen", value: safeLength(user.examAttempts), rawValue: user.examAttempts },
  };

  const readOnlyFields = Object.entries(visibleColumns)
    .filter(([_, visible]) => visible)
    .map(([key]) => ({ key, ...fieldMap[key as keyof User] }));

  // Agrupar los campos para un mejor diseño  
  const userInfoFields = readOnlyFields.filter(field => 
    ["fullName", "email", "username", "phone"].includes(field.key));
  
  const statusFields = readOnlyFields.filter(field => 
    ["isActive", "isBanned", "isDeleted", "additionalStatus"].includes(field.key));
  
  const activityFields = readOnlyFields.filter(field => 
    ["lastSignInAt", "createdAt", "updatedAt"].includes(field.key));
  
  const statsFields = readOnlyFields.filter(field => 
    ["courses", "purchases", "userProgress", "invoices", "examAttempts"].includes(field.key));
  
  const metadataField = readOnlyFields.find(field => field.key === "metadata");
  
  const otherFields = readOnlyFields.filter(field => 
    !["fullName", "email", "username", "phone", "isActive", "isBanned", "isDeleted", "additionalStatus", 
      "lastSignInAt", "createdAt", "updatedAt", "courses", "purchases", "userProgress", "invoices", "examAttempts", "metadata"].includes(field.key));

  const renderFieldValue = (field: any) => {
    if (field.key === "isActive") {
      return (
        <Badge className={field.value === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {field.value}
        </Badge>
      );
    } else if (field.key === "isBanned" || field.key === "isDeleted") {
      return (
        <Badge className={field.value === "Sí" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
          {field.value}
        </Badge>
      );
    } else if (field.key === "customRole") {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          {field.value}
        </Badge>
      );
    } else {
      return field.value;
    }
  };

  const renderCopyButton = (field: any) => {
    if (field.rawValue && typeof field.rawValue !== 'object' && field.rawValue !== "") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => copyToClipboard(field.rawValue.toString(), field.key)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copiedField === field.key ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {copiedField === field.key ? "¡Copiado!" : "Copiar al portapapeles"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return null;
  };

  const renderFieldGroup = (fields: typeof readOnlyFields, title: string) => {
    if (fields.length === 0) return null;
    
    return (
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center">
                  <Label className="text-xs font-medium text-gray-500">{field.label}</Label>
                  {renderCopyButton(field)}
                </div>
                <p className="text-sm font-medium whitespace-pre-wrap">
                  {renderFieldValue(field)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMetadataField = () => {
    if (!metadataField || metadataField.rawValue === null) return null;

    const metadata = metadataField.rawValue;
    if (!metadata || Object.keys(metadata).length === 0) return (
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-700">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Sin datos</p>
        </CardContent>
      </Card>
    );

    return (
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-medium text-gray-700">Metadata</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(metadata), "metadata-full")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === "metadata-full" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {copiedField === "metadata-full" ? "¡Copiado!" : "Copiar todo"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(metadata).map(([key, value], idx) => (
                <div key={idx} className="flex items-start group">
                  <div className="min-w-[6px] h-6 bg-blue-400 rounded-full mr-2 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">{key}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => copyToClipboard(value?.toString() || "", `metadata-${key}`)}
                              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedField === `metadata-${key}` ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedField === `metadata-${key}` ? "¡Copiado!" : "Copiar valor"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm font-medium">
                      {typeof value === "boolean" ? (
                        <Badge className={value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {value ? "Sí" : "No"}
                        </Badge>
                      ) : (
                        value?.toString() || ""
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Usuario</DialogTitle>
          <DialogDescription className="text-gray-500">
            {user.fullName || user.username || user.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {renderFieldGroup(userInfoFields, "Información Personal")}
            {renderFieldGroup(statusFields, "Estado de la Cuenta")}
            {renderFieldGroup(activityFields, "Actividad del Usuario")}
            {renderFieldGroup(statsFields, "Estadísticas")}
            {renderMetadataField()}
            {renderFieldGroup(otherFields, "Información Adicional")}
          </div>

          <Separator className="my-6" />

          <Card className="shadow-md bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Modificar Rol del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customRole" className="text-sm font-medium">
                  Seleccionar Nuevo Rol
                </Label>
                <Select
                  value={translateRole(formData.customRole)}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, customRole: translateRole(value) }))
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllRoles().map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={isLoading}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
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