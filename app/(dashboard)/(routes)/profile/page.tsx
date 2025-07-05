"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import {
  UserCircle2,
  Mail,
  Clock,
  CalendarCheck,
  ShieldCheck,
  KeyRound,
  Shield,
  Phone,
  Fingerprint,
  Globe,
  User,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "../../../auth/CurrentUser/getCurrentUserFromDB";

export default function UserProfileDashboard() {
  const [userData, setUserData] = useState<UserDB | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "settings">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCurrentUserFromDB();
      setUserData(data);
      if (data) {
        setEditValues({
          phone: data.phone || "",
          username: data.username || "",
        });
      }
    };
    fetchData();
  }, []);

  const editableFields = ["phone", "username"];
  
  const handleEdit = (field: string) => {
    setEditingField(field);
    setIsEditing(true);
  };

  const handleSave = async (field: string) => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: editValues[field],
        }),
      });

      if (response.ok) {
        const updatedUser = { ...userData };
        if (field === "phone") {
          updatedUser.phone = editValues[field];
        } else if (field === "username") {
          updatedUser.username = editValues[field];
        }
        setUserData(updatedUser);
        setEditingField(null);
        setIsEditing(false);
      } else {
        console.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setEditValues({
        phone: userData.phone || "",
        username: userData.username || "",
      });
    }
    setEditingField(null);
    setIsEditing(false);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "La contraseña debe contener al menos una letra minúscula";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "La contraseña debe contener al menos una letra mayúscula";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "La contraseña debe contener al menos un número";
    }
    return "";
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    
    if (!passwordData.currentPassword) {
      setPasswordError("Por favor ingresa tu contraseña actual");
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError("Por favor ingresa una nueva contraseña");
      return;
    }
    
    const validationError = validatePassword(passwordData.newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setIsChangePasswordOpen(false);
        alert("Contraseña cambiada exitosamente");
      } else {
        setPasswordError(result.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setPasswordError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!userData) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center flex flex-col justify-center items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-teal-200 border-b-teal-600 animate-spin animate-reverse"></div>
          </div>
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mt-6">
            Cargando perfil...
          </span>
        </div>
      </div>
    );
  }

  const user = userData;
  const metadata = user.metadata as any;
  const username = user.username || metadata?.username || "No definido";

  const profileSections = [
    {
      icon: <UserCircle2 className="mr-3 text-primaryCustom2" />,
      label: "Nombre de usuario",
      value: username,
      field: "username",
      editable: true,
    },
    {
      icon: <Mail className="mr-3 text-primaryCustom" />,
      label: "Correo electrónico",
      value: user.email,
      field: "email",
      editable: false,
    },
    {
      icon: <Phone className="mr-3 text-accentCustom" />,
      label: "Teléfono",
      value: user.phone || "No proporcionado",
      field: "phone",
      editable: true,
    },
    {
      icon: <Clock className="mr-3 text-primaryCustom" />,
      label: "Último login",
      value: user.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString()
        : "Nunca",
      field: "lastSignInAt",
      editable: false,
    },
    {
      icon: <CalendarCheck className="mr-3 text-primaryCustom2" />,
      label: "Cuenta creada",
      value: new Date(user.createdAt).toLocaleString(),
      field: "createdAt",
      editable: false,
    },
    {
      icon: <Fingerprint className="mr-3 text-primaryCustom" />,
      label: "ID de usuario",
      value: user.id,
      field: "id",
      editable: false,
    },
    {
      icon: <Globe className="mr-3 text-accentCustom2" />,
      label: "Proveedor",
      value: user.provider || "Desconocido",
      field: "provider",
      editable: false,
    },
    {
      icon: <Shield className="mr-3 text-primaryCustom2" />,
      label: "Rol personalizado",
      value: user.customRole || "No asignado",
      field: "customRole",
      editable: false,
    },
    {
      icon: <Shield className="mr-3 text-primaryCustom" />,
      label: "Estado adicional",
      value: user.additionalStatus,
      field: "additionalStatus",
      editable: false,
    },
  ];

  return (
    <div className="min-h-screen py-6 flex flex-col items-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-6xl w-full space-y-6 px-4">
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl backdrop-blur-sm bg-white/95 border-0">
          <CardHeader className="rounded-t-xl pb-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/90"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </div>
            <div className="relative z-10 flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-3 border-white/30 shadow-xl ring-2 ring-white/20">
                    <AvatarImage
                      src={metadata.full_name || "/placeholder-user.png"}
                      alt={metadata.full_name || "User"}
                    />
                    <AvatarFallback className="text-xl text-white bg-gradient-to-br from-emerald-500 to-teal-500">
                      {metadata.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white mb-1">
                    {metadata.full_name}
                  </CardTitle>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <Badge className="mt-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors text-xs">
                    <Shield className="w-4 h-4 mr-2" /> {user.customRole}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${
                    activeSection === "profile"
                      ? "bg-white text-emerald-600 border-white shadow-lg transform scale-105"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50"
                  }`}
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveSection("settings")}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${
                    activeSection === "settings"
                      ? "bg-white text-emerald-600 border-white shadow-lg transform scale-105"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50"
                  }`}
                >
                  Configuración
                </button>
              </div>
            </div>
          </CardHeader>

          <Separator className="my-2" />

          {activeSection === "profile" && (
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileSections.map((section, index) => (
                  <div
                    key={index}
                    className="group relative rounded-lg p-4 bg-white border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 to-teal-50/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-200">
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">
                            {section.label}
                          </p>
                          {editingField === section.field ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editValues[section.field] || ""}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    [section.field]: e.target.value,
                                  })
                                }
                                className="flex-1"
                                disabled={isLoading}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSave(section.field)}
                                disabled={isLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="font-medium text-sm text-gray-800 break-words">
                              {section.value}
                            </p>
                          )}
                        </div>
                      </div>
                      {section.editable && editingField !== section.field && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(section.field)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}

          {activeSection === "settings" && (
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <div className="group relative rounded-lg p-6 bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="relative z-10">
                        <div className="p-3 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 w-fit mb-3 group-hover:from-emerald-600 group-hover:to-emerald-700 transition-all duration-200">
                          <KeyRound className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-base mb-2 text-gray-800">
                          Seguridad
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Gestiona tu contraseña y autenticación de manera segura.
                        </p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
                        Cambiar Contraseña
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                          Contraseña Actual
                        </Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="pr-10"
                            placeholder="Ingresa tu contraseña actual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                          Nueva Contraseña
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="pr-10"
                            placeholder="Ingresa una nueva contraseña"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                          Confirmar Nueva Contraseña
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="pr-10"
                            placeholder="Confirma tu nueva contraseña"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {passwordError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                          {passwordError}
                        </div>
                      )}
                      
                      <div className="flex space-x-3 pt-4">
                        <Button
                          onClick={handlePasswordChange}
                          disabled={isChangingPassword}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isChangingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Cambiando...
                            </>
                          ) : (
                            'Cambiar Contraseña'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsChangePasswordOpen(false);
                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                            setPasswordError("");
                          }}
                          disabled={isChangingPassword}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <PrivacyPolicyModal 
                  trigger={
                    <div className="group relative rounded-lg p-6 bg-gradient-to-br from-white to-teal-50 border border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-teal-100/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="relative z-10">
                        <div className="p-3 rounded-md bg-gradient-to-br from-teal-500 to-teal-600 w-fit mb-3 group-hover:from-teal-600 group-hover:to-teal-700 transition-all duration-200">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-base mb-2 text-gray-800">
                          Privacidad
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Controla tus datos personales y configuraciones de privacidad.
                        </p>
                      </div>
                    </div>
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
