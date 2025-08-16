"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Shield, Users, Book, Brain, Settings, Eye } from "lucide-react";
import { getActiveModules, getInactiveModules, MODULES } from '@/config/modules';
import { getAllModulesForRole, MODULE_ACTIVATION_CONFIG } from '@/config/module-activation';
import { getCurrentUserFromDB } from '@/app/auth/CurrentUser/getCurrentUserFromDB';
import { getRoleLabel } from '@/utils/roles/translate';
import RoleGuard from '@/components/security/RoleGuard';

interface ModuleStatusProps {
  role: string;
  roleLabel: string;
  activeModules: string[];
  inactiveModules: string[];
}

const MODULE_ICONS: Record<string, any> = {
  dashboard: Settings,
  user_management: Users,
  course_management: Book,
  exam_management: Brain,
  analytics: Shield,
  default: Eye,
};

const ModuleStatusCard = ({ role, roleLabel, activeModules, inactiveModules }: ModuleStatusProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Estado de Módulos - {roleLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Módulos Activos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-green-800">
              Módulos Activos ({activeModules.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeModules.map((module) => {
              const IconComponent = MODULE_ICONS[module] || MODULE_ICONS.default;
              return (
                <div
                  key={module}
                  className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <IconComponent className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                    ✓ Activo
                  </Badge>
                </div>
              );
            })}
          </div>
          {activeModules.length === 0 && (
            <p className="text-sm text-gray-500 italic">No hay módulos activos para este rol.</p>
          )}
        </div>

        <Separator />

        {/* Módulos Inactivos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-orange-800">
              Módulos Inactivos - Requieren Pago ({inactiveModules.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inactiveModules.map((module) => {
              const IconComponent = MODULE_ICONS[module] || MODULE_ICONS.default;
              return (
                <div
                  key={module}
                  className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <IconComponent className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    {module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700">
                    💰 Pago
                  </Badge>
                </div>
              );
            })}
          </div>
          {inactiveModules.length === 0 && (
            <p className="text-sm text-gray-500 italic">Todos los módulos están activos para este rol.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ModulesStatusPage() {
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [modulesByRole, setModulesByRole] = useState<Record<string, { active: string[], inactive: string[] }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModuleStatus = async () => {
      try {
        const user = await getCurrentUserFromDB();
        const role = user?.customRole || 'visitor';
        setCurrentUserRole(role);

        // Obtener estado de módulos para todos los roles relevantes
        const roles = ['super_admin', 'admin', 'teacher', 'student', 'visitor'];
        const moduleData: Record<string, { active: string[], inactive: string[] }> = {};

        roles.forEach(roleKey => {
          const active = getActiveModules(roleKey as keyof typeof MODULES);
          const inactive = getInactiveModules(roleKey as keyof typeof MODULES);
          moduleData[roleKey] = { active, inactive };
        });

        setModulesByRole(moduleData);
      } catch (error) {
        console.error('Error loading module status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModuleStatus();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando estado de módulos...</div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Estado de Módulos del Sistema</h1>
            <p className="text-gray-600">Vista de solo lectura de todos los módulos por rol</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">Información Importante</h3>
              <p className="text-blue-700 text-sm mt-1">
                Esta es una vista de <strong>solo lectura</strong>. Para activar módulos cuando los clientes paguen, 
                edite manualmente el archivo <code>/config/modules.ts</code> o use las funciones programáticas.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(modulesByRole).map(([role, modules]) => (
            <ModuleStatusCard
              key={role}
              role={role}
              roleLabel={getRoleLabel(role)}
              activeModules={modules.active}
              inactiveModules={modules.inactive}
            />
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones para Activar Módulos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Opción 1: Edición Manual (Recomendada)</h4>
              <p className="text-sm text-gray-600">
                Editar <code>/config/modules.ts</code> y cambiar <code>false → true</code> para el módulo deseado.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Opción 2: Programática</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div>import &#123; activate &#125; from &apos;@/config/modules&apos;;</div>
                <div>activate(&apos;teacher&apos;, &apos;protocols&apos;);</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}