"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCurrentUserFromDB();
      setUserData(data);
    };
    fetchData();
  }, []);

  if (!userData) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <div className="text-center flex flex-col justify-center items-center">
          <div className="animate-pulse w-16 h-16 mb-4 bg-gray-300 rounded-full"></div>
          <span className="text-lg font-semibold text-primaryCustom2">
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
    },
    {
      icon: <Mail className="mr-3 text-primaryCustom" />,
      label: "Correo electrónico",
      value: user.email,
    },
    {
      icon: <Phone className="mr-3 text-accentCustom" />,
      label: "Teléfono",
      value: user.phone || "No proporcionado",
    },
    {
      icon: <Clock className="mr-3 text-primaryCustom" />,
      label: "Último login",
      value: user.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString()
        : "Nunca",
    },
    {
      icon: <CalendarCheck className="mr-3 text-primaryCustom2" />,
      label: "Cuenta creada",
      value: new Date(user.createdAt).toLocaleString(),
    },
    {
      icon: <Fingerprint className="mr-3 text-primaryCustom" />,
      label: "ID de usuario",
      value: user.id,
    },
    {
      icon: <Globe className="mr-3 text-accentCustom2" />,
      label: "Proveedor",
      value: user.provider || "Desconocido",
    },
    {
      icon: <Shield className="mr-3 text-primaryCustom2" />,
      label: "Rol personalizado",
      value: user.customRole || "No asignado",
    },
    {
      icon: <Shield className="mr-3 text-primaryCustom" />,
      label: "Estado adicional",
      value: user.additionalStatus,
    },
  ];

  return (
    <div className="min-h-screen py-10 flex flex-col items-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-4xl w-full space-y-8 px-4">
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="rounded-t-lg pb-4 bg-white">
            <div className="flex justify-between items-center flex-col md:flex-row gap-6 md:gap-0">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border-4 border-primaryCustom2 shadow-md">
                  <AvatarImage
                    src={metadata.full_name || "/placeholder-user.png"}
                    alt={metadata.full_name || "User"}
                  />
                  <AvatarFallback className="text-3xl text-primaryCustom2">
                    {metadata.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold text-primaryCustom2">
                    {metadata.full_name}
                  </CardTitle>
                  <p className="text-sm text-primaryCustom">{user.email}</p>
                  <Badge className="mt-2" variant="secondary">
                    <Shield className="w-4 h-4 mr-1" /> {user.customRole}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`px-4 py-2 rounded-lg border border-transparent transition-colors font-semibold ${
                    activeSection === "profile"
                      ? "bg-primaryCustom2 text-white"
                      : "bg-white text-primaryCustom2 hover:bg-slate-100"
                  }`}
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveSection("settings")}
                  className={`px-4 py-2 rounded-lg border border-transparent transition-colors font-semibold ${
                    activeSection === "settings"
                      ? "bg-primaryCustom2 text-white"
                      : "bg-white text-primaryCustom2 hover:bg-slate-100"
                  }`}
                >
                  Configuración
                </button>
              </div>
            </div>
          </CardHeader>

          <Separator className="my-4" />

          {activeSection === "profile" && (
            <CardContent className="space-y-4">
              {profileSections.map((section, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  {section.icon}
                  <div>
                    <p className="text-sm text-primaryCustom">
                      {section.label}
                    </p>
                    <p className="font-semibold text-primaryCustom2">
                      {section.value}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}

          {activeSection === "settings" && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                  <KeyRound className="w-6 h-6 mb-2 text-primaryCustom2" />
                  <h3 className="font-semibold mb-1 text-primaryCustom2">
                    Seguridad
                  </h3>
                  <p className="text-sm text-primaryCustom">
                    Gestiona tu contraseña y autenticación.
                  </p>
                </div>
                <div className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                  <ShieldCheck className="w-6 h-6 mb-2 text-primaryCustom" />
                  <h3 className="font-semibold mb-1 text-primaryCustom">
                    Privacidad
                  </h3>
                  <p className="text-sm text-primaryCustom">
                    Controla tus datos y configuraciones.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
