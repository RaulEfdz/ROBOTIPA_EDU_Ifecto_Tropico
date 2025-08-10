"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, Star, Award, Activity } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import RoleGuard from "@/components/security/RoleGuard"

interface TeacherPerformance {
  teacherId: string
  teacherName: string
  teacherEmail: string
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  averageRating: number
  totalEarnings: number
  totalCreditsEarned: number
  studentsSatisfaction: number
  monthlyGrowth: number
  joinDate: string
  lastActiveDate: string
  topSubjects: string[]
}

interface PerformanceMetrics {
  topPerformers: TeacherPerformance[]
  averageMetrics: {
    sessionCompletionRate: number
    averageRating: number
    monthlySessionsPerTeacher: number
    averageEarningsPerTeacher: number
  }
  periodStats: {
    totalSessions: number
    totalRevenue: number
    activeTeachers: number
    newTeachers: number
  }
}

const PERIOD_OPTIONS = [
  { value: "week", label: "Última semana" },
  { value: "month", label: "Último mes" },
  { value: "quarter", label: "Último trimestre" },
  { value: "year", label: "Último año" },
  { value: "all", label: "Todo el tiempo" }
]

function AnalyticsPageContent() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/admin/analytics?period=${period}`)
      setMetrics(response.data)
    } catch (error: any) {
      console.error("Error fetching analytics:", error)
      if (error.response?.status === 403) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para ver las analíticas",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las analíticas",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600"
    if (rating >= 4.0) return "text-blue-600"
    if (rating >= 3.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (rating: number) => {
    if (rating >= 4.5) return { label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" }
    if (rating >= 4.0) return { label: "Muy Bueno", color: "bg-blue-100 text-blue-800 border-blue-300" }
    if (rating >= 3.5) return { label: "Bueno", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    return { label: "Necesita Mejora", color: "bg-red-100 text-red-800 border-red-300" }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Analíticas de Rendimiento</h1>
        </div>
        <p className="text-muted-foreground">
          Métricas detalladas del rendimiento de profesores y sistema
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            🔒 Módulo Administrativo - Acceso Restringido
          </Badge>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {metrics && (
        <>
          {/* Métricas generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.averageMetrics.sessionCompletionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio de sesiones completadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(metrics.averageMetrics.averageRating)}`}>
                  {metrics.averageMetrics.averageRating.toFixed(2)} ★
                </div>
                <p className="text-xs text-muted-foreground">
                  Calificación general del sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sesiones/Profesor</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.averageMetrics.monthlySessionsPerTeacher.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio mensual por profesor
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos/Profesor</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${metrics.averageMetrics.averageEarningsPerTeacher.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ganancias promedio por profesor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas del período */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.periodStats.totalSessions}</div>
                  <p className="text-sm text-muted-foreground">Sesiones Totales</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${metrics.periodStats.totalRevenue.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.periodStats.activeTeachers}</div>
                  <p className="text-sm text-muted-foreground">Profesores Activos</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{metrics.periodStats.newTeachers}</div>
                  <p className="text-sm text-muted-foreground">Nuevos Profesores</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Mejores Profesores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Sesiones</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Rendimiento</TableHead>
                    <TableHead>Ganancias</TableHead>
                    <TableHead>Crecimiento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topPerformers.map((teacher, index) => {
                    const completionRate = teacher.totalSessions > 0 
                      ? (teacher.completedSessions / teacher.totalSessions) * 100 
                      : 0
                    const performanceBadge = getPerformanceBadge(teacher.averageRating)
                    
                    return (
                      <TableRow key={teacher.teacherId}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {index < 3 && (
                                <span className="text-lg">
                                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                </span>
                              )}
                              {teacher.teacherName}
                            </div>
                            <div className="text-sm text-muted-foreground">{teacher.teacherEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{teacher.completedSessions}</div>
                            <div className="text-xs text-muted-foreground">
                              {completionRate.toFixed(1)}% completadas
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className={`font-bold ${getPerformanceColor(teacher.averageRating)}`}>
                              {teacher.averageRating.toFixed(2)} ★
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teacher.studentsSatisfaction.toFixed(1)}% satisfacción
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={performanceBadge.color}>
                            {performanceBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              ${teacher.totalEarnings.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teacher.totalCreditsEarned} créditos
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className={`font-medium ${teacher.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {teacher.monthlyGrowth >= 0 ? '+' : ''}{teacher.monthlyGrowth.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              vs mes anterior
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <RoleGuard 
      adminOnly={true}
      fallbackPath="/"
      showError={true}
    >
      <AnalyticsPageContent />
    </RoleGuard>
  )
}