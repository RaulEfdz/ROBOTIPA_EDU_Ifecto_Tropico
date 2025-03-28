"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserData, SupabaseSession } from "../(auth)/auth/userCurrent";
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
  CheckCircle,
  ListChecks,
  Fingerprint,
  Globe,
  ArrowLeft,
  User
} from "lucide-react";

export default function UserProfileDashboard() {
  // Paleta de colores
  const brandPrimary = "#FFFCF8"; // Fondo de tarjetas
  const brandSecondaryDark = "#47724B"; // Color principal para textos y detalles
  const brandSecondary = "#ACBC64"; // Acento en iconos y textos secundarios
  const brandTertiaryDark = "#386329"; // Titulares y estados activos
  const brandTertiary = "#C8E065"; // Toques de resalte

  const [userData, setUserData] = useState<SupabaseSession | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'settings'>('profile');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserData();
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

  const { user } = userData;
  const metadata = user.user_metadata;
  const identity = user.identities[0];

  const profileSections = [
    {
      icon: <UserCircle2 className="mr-3" style={{ color: brandSecondaryDark }} />,
      label: 'Nombre de usuario',
      value: metadata.username
    },
    {
      icon: <Mail className="mr-3" style={{ color: brandSecondary }} />,
      label: 'Correo electrónico',
      value: user.email
    },
    {
      icon: <CheckCircle className="mr-3" style={{ color: brandTertiaryDark }} />,
      label: 'Correo verificado',
      value: user.email_confirmed_at ? 'Verificado' : 'No verificado'
    },
    {
      icon: <Phone className="mr-3" style={{ color: brandTertiary }} />,
      label: 'Teléfono',
      value: user.phone || 'No proporcionado'
    },
    {
      icon: <CheckCircle className="mr-3" style={{ color: brandTertiaryDark }} />,
      label: 'Teléfono verificado',
      value: metadata.phone_verified ? 'Verificado' : 'No verificado'
    },
    {
      icon: <Clock className="mr-3" style={{ color: brandSecondary }} />,
      label: 'Último login',
      value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'
    },
    {
      icon: <CalendarCheck className="mr-3" style={{ color: brandSecondaryDark }} />,
      label: 'Cuenta creada',
      value: new Date(user.created_at).toLocaleString()
    },
    {
      icon: <Fingerprint className="mr-3" style={{ color: brandSecondary }} />,
      label: 'ID de usuario',
      value: user.id
    },
    {
      icon: <Globe className="mr-3" style={{ color: brandTertiaryDark }} />,
      label: 'Proveedor',
      value: identity?.provider || 'Desconocido'
    },
    {
      icon: <ListChecks className="mr-3" style={{ color: brandTertiary }} />,
      label: 'Proveedores',
      value: user.app_metadata?.providers?.join(', ') || 'Ninguno'
    },
    {
      icon: <Shield className="mr-3" style={{ color: brandSecondaryDark }} />,
      label: 'Rol',
      value: user.role
    },
    {
      icon: <CheckCircle className="mr-3" style={{ color: brandTertiaryDark }} />,
      label: 'Confirmación enviada',
      value: user.confirmation_sent_at ? new Date(user.confirmation_sent_at).toLocaleString() : 'No enviado'
    },
    {
      icon: <CheckCircle className="mr-3" style={{ color: brandTertiaryDark }} />,
      label: 'Confirmado en',
      value: user.confirmed_at ? new Date(user.confirmed_at).toLocaleString() : 'No confirmado'
    },
    {
      icon: <Shield className="mr-3" style={{ color: brandSecondary }} />,
      label: 'Anónimo',
      value: user.is_anonymous ? 'Sí' : 'No'
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
          <User
            size={24} 
            color={brandSecondaryDark} 
            className="mr-2" 
          />
          <h1 
            className="text-2xl font-bold" 
            style={{ color: brandSecondaryDark }}
          >
            Perfil de Usuario
          </h1>
        </div>
        <Link href="/">
          <button
            type="button"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ 
              backgroundColor: brandSecondaryDark, 
              color: brandPrimary 
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
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage
                    src={metadata.full_name || "/placeholder-user.png"}
                    alt={metadata.full_name}
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
                    <Shield className="w-4 h-4 mr-1" /> {user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveSection('profile')}
                  style={{
                    backgroundColor: activeSection === 'profile' ? brandSecondaryDark : brandPrimary,
                    color: activeSection === 'profile' ? brandPrimary : brandSecondaryDark,
                  }}
                  className="px-4 py-2 rounded-lg border border-transparent transition-colors hover:bg-gray-100"
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveSection('settings')}
                  style={{
                    backgroundColor: activeSection === 'settings' ? brandSecondaryDark : brandPrimary,
                    color: activeSection === 'settings' ? brandPrimary : brandSecondaryDark,
                  }}
                  className="px-4 py-2 rounded-lg border border-transparent transition-colors hover:bg-gray-100"
                >
                  Configuración
                </button>
              </div>
            </div>
          </CardHeader>

          <Separator className="my-4" />

          {activeSection === 'profile' && (
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

          {activeSection === 'settings' && (
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
                {/* Puedes agregar más opciones de configuración aquí */}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
