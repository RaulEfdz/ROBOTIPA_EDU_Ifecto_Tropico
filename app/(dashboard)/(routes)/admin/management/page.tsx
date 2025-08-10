"use client"

import { useState, useEffect } from "react"
import { Users, TrendingUp, DollarSign, Activity, Settings, Shield, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import RoleGuard from "@/components/security/RoleGuard"

interface AdminStats {
  totalTeachers: number
  activeTeachers: number
  totalStudents: number
  activeStudents: number
  totalSessions: number
  pendingPayments: number
  totalRevenue: number
  monthlyGrowth: number
}

const ADMIN_MODULES = [
  {
    title: "Gestión de Profesores",
    description: "Administrar profesores, pagos y rendimiento",
    icon: Users,
    href: "/admin/teacher-management",
    color: "bg-blue-500",
    permissions: ["teacher_management"]
  },
  {
    title: "Pagos a Profesores", 
    description: "Procesar pagos y comisiones",
    icon: DollarSign,
    href: "/admin/teacher-payments",
    color: "bg-green-500",
    permissions: ["teacher_payments"]
  },
  {
    title: "Analíticas Avanzadas",
    description: "Reportes y métricas del sistema",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "bg-purple-500",
    permissions: ["teacher_performance"]
  },
  {
    title: "Gestión de Usuarios",
    description: "Administrar todos los usuarios del sistema",
    icon: Shield,
    href: "/admin/user-management", 
    color: "bg-orange-500",
    permissions: ["user_management"]
  },
  {
    title: "Configuración del Sistema",
    description: "Ajustes generales y configuraciones",
    icon: Settings,
    href: "/admin/system-settings",
    color: "bg-gray-500",
    permissions: ["system_settings"]
  },
  {
    title: "Reportes y Auditoría",
    description: "Logs de actividad y reportes de seguridad", 
    icon: FileText,
    href: "/admin/reports",
    color: "bg-red-500",
    permissions: ["system_settings"]
  }
]

function AdminManagementPageContent() {
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/admin/stats")
      setStats(response.data)
    } catch (error: any) {
      console.error("Error fetching admin stats:", error)
      if (error.response?.status === 403) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder a este módulo administrativo",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando panel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Panel Administrativo</h1>
        </div>
        <p className="text-muted-foreground">
          Gestión avanzada del sistema - Solo administradores
        </p>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            🔒 Acceso Restringido - Nivel Administrativo
          </Badge>
        </div>
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profesores Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.activeTeachers}
              </div>
              <p className="text-xs text-muted-foreground">
                de {stats.totalTeachers} registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                de {stats.totalStudents} registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${stats.pendingPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.monthlyGrowth.toFixed(1)}% este mes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Módulos administrativos */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Módulos Administrativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADMIN_MODULES.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.href} href={module.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {module.description}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/teacher-payments">
                <DollarSign className="h-4 w-4 mr-2" />
                Procesar Pagos
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/admin/user-management">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/admin/reports">
                <FileText className="h-4 w-4 mr-2" />
                Ver Reportes
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/admin/system-settings">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminManagementPage() {
  return (
    <RoleGuard 
      adminOnly={true}
      fallbackPath="/"
      showError={true}
    >
      <AdminManagementPageContent />
    </RoleGuard>
  )
}