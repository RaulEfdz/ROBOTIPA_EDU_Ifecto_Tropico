"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
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
  CheckCircle,
  ListChecks,
  Fingerprint,
  Globe,
  ArrowLeft,
  User,
} from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "../auth/CurrentUser/getCurrentUserFromDB";

export default function UserProfileDashboard() {
  const brandPrimary = "#FFFCF8";
  const brandSecondaryDark = "#47724B";
  const brandSecondary = "#ACBC64";
  const brandTertiaryDark = "#386329";
  const brandTertiary = "#C8E065";

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
      <div
        className="flex min-h-screen justify-center items-center"
        style={{ backgroundColor: brandPrimary }}
      >
        <div className="text-center flex flex-col justify-center items-center">
          <div className="animate-pulse w-16 h-16 mb-4 bg-gray-300 rounded-full"></div>
          <span className="text-lg font-semibold" style={{ color: brandSecondaryDark }}>
            Cargando perfil...
          </span>
        </div>
      </div>
    );
  }

  const user = userData;
  const metadata = user.metadata as any; // aseguramos que es un objeto
  const username = user.username || metadata?.username || "No definido";

  const profileSections = [
    {
      icon: <UserCircle2 className="mr-3" style={{ color: brandSecondaryDark }} />,
      label: "Nombre de usuario",
      value: username,
    },
    {
      icon: <Mail className="mr-3" style={{ color: brandSecondary }} />,
      label: "Correo electrónico",
      value: user.email,
    },
    {
      icon: <Phone className="mr-3" style={{ color: brandTertiary }} />,
      label: "Teléfono",
      value: user.phone || "No proporcionado",
    },
    {
      icon: <Clock className="mr-3" style={{ color: brandSecondary }} />,
      label: "Último login",
      value: user.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString()
        : "Nunca",
    },
    {
      icon: <CalendarCheck className="mr-3" style={{ color: brandSecondaryDark }} />,
      label: "Cuenta creada",
      value: new Date(user.createdAt).toLocaleString(),
    },
    {
      icon: <Fingerprint className="mr-3" style={{ color: brandSecondary }} />,
      label: "ID de usuario",
      value: user.id,
    },
    {
      icon: <Globe className="mr-3" style={{ color: brandTertiaryDark }} />,
      label: "Proveedor",
      value: user.provider || "Desconocido",
    },
    {
      icon: <Shield className="mr-3" style={{ color: brandSecondaryDark }} />,
      label: "Rol personalizado",
      value: user.customRole || "No asignado",
    },
    {
      icon: <Shield className="mr-3" style={{ color: brandSecondary }} />,
      label: "Estado adicional",
      value: user.additionalStatus,
    },
  ];

  return (
    <div
      className="min-h-screen py-10 flex flex-col items-center"
      style={{ backgroundColor: brandPrimary }}
    >
      {/* Barra de navegación superior */}
      <nav className="w-full max-w-4xl px-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User size={24} color={brandSecondaryDark} className="mr-2" />
            <h1 className="text-2xl font-bold" style={{ color: brandSecondaryDark }}>
              Perfil de Usuario
            </h1>
          </div>
          <Link href="/">
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100"
              style={{
                backgroundColor: brandSecondaryDark,
                color: brandPrimary,
              }}
            >
              <ArrowLeft size={20} />
              <span>Volver a Inicio</span>
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl w-full space-y-8 px-4">
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="rounded-t-lg pb-4" style={{ backgroundColor: brandPrimary }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border-4 border-TextCustom shadow-md">
                  <AvatarImage
                    src={metadata.full_name || "/placeholder-user.png"}
                    alt={metadata.full_name || "User"}
                  />
                  <AvatarFallback className="text-3xl" style={{ color: brandSecondaryDark }}>
                    {metadata.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold" style={{ color: brandSecondaryDark }}>
                    {metadata.full_name}
                  </CardTitle>
                  <p className="text-sm" style={{ color: brandSecondary }}>
                    {user.email}
                  </p>
                  <Badge className="mt-2" variant="secondary">
                    <Shield className="w-4 h-4 mr-1" /> {user.customRole}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  style={{
                    backgroundColor:
                      activeSection === "profile" ? brandSecondaryDark : brandPrimary,
                    color:
                      activeSection === "profile" ? brandPrimary : brandSecondaryDark,
                  }}
                  className="px-4 py-2 rounded-lg border border-transparent transition-colors hover:bg-gray-100"
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveSection("settings")}
                  style={{
                    backgroundColor:
                      activeSection === "settings" ? brandSecondaryDark : brandPrimary,
                    color:
                      activeSection === "settings" ? brandPrimary : brandSecondaryDark,
                  }}
                  className="px-4 py-2 rounded-lg border border-transparent transition-colors hover:bg-gray-100"
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
                  className="flex items-center rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: brandPrimary }}
                >
                  {section.icon}
                  <div>
                    <p className="text-sm" style={{ color: brandSecondary }}>
                      {section.label}
                    </p>
                    <p className="font-semibold" style={{ color: brandSecondaryDark }}>
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
                <div
                  className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <KeyRound className="w-6 h-6 mb-2" style={{ color: brandSecondaryDark }} />
                  <h3 className="font-semibold mb-1" style={{ color: brandSecondaryDark }}>
                    Seguridad
                  </h3>
                  <p className="text-sm" style={{ color: brandSecondary }}>
                    Gestiona tu contraseña y autenticación.
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <ShieldCheck className="w-6 h-6 mb-2" style={{ color: brandSecondary }} />
                  <h3 className="font-semibold mb-1" style={{ color: brandSecondary }}>
                    Privacidad
                  </h3>
                  <p className="text-sm" style={{ color: brandSecondary }}>
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
