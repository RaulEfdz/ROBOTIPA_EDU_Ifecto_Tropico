"use client";

import { Clock, CheckCircle, XCircle, Users, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationStatsProps {
  stats: {
    NO_SUBMITTED: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    total: number;
  };
}

export function ValidationStats({ stats }: ValidationStatsProps) {
  const statCards = [
    {
      title: "Total de Usuarios",
      value: stats.total,
      icon: Users,
      description: "Usuarios registrados",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pendientes de Revisión",
      value: stats.PENDING,
      icon: Clock,
      description: "Requieren atención",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Documentos Aprobados",
      value: stats.APPROVED,
      icon: CheckCircle,
      description: "Validaciones completadas",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Documentos Rechazados",
      value: stats.REJECTED,
      icon: XCircle,
      description: "Requieren corrección",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Sin Documentos",
      value: stats.NO_SUBMITTED,
      icon: FileText,
      description: "No han subido documento",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  // Calcular porcentajes
  const getPercentage = (value: number) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        const percentage = getPercentage(stat.value);
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stat.description}</span>
                  <span>{percentage}%</span>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${stat.color.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Tarjeta de resumen adicional */}
      <Card className="md:col-span-2 lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Estado de Validaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tasa de completado */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getPercentage(stats.APPROVED)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Tasa de Aprobación
              </div>
            </div>

            {/* Pendientes de acción */}
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.PENDING}
              </div>
              <div className="text-sm text-muted-foreground">
                Necesitan Revisión
              </div>
              {stats.PENDING > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Acción requerida
                  </span>
                </div>
              )}
            </div>

            {/* Sin iniciar proceso */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.NO_SUBMITTED}
              </div>
              <div className="text-sm text-muted-foreground">
                No Han Iniciado
              </div>
              {stats.NO_SUBMITTED > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {getPercentage(stats.NO_SUBMITTED)}% de usuarios
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}