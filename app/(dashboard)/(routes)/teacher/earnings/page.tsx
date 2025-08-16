"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, CreditCard, Users, Calendar, Star, MessageCircle } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import SessionsHeader from "../_components/SessionsHeader"

interface TeacherEarnings {
  totalCredits: number
  totalEarnings: number
  completedSessions: number
  averageRating: number
  recentSessions: {
    id: string
    title: string
    scheduledAt: string
    creditsEarned: number
    rating?: number
    feedback?: string
    student: {
      fullName: string
    }
  }[]
  monthlyStats: {
    month: string
    credits: number
    earnings: number
    sessions: number
  }[]
  debugInfo?: {
    totalSessionsAllTime: number
    upcomingSessionsCount: number
    searchPeriod: {
      from: string
      to: string
      period: string
    }
  }
  upcomingSessions?: {
    id: string
    title: string
    scheduledAt: string
    status: string
    creditsRequired: number
    student: {
      fullName: string
    }
  }[]
}

const PERIOD_OPTIONS = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Últimos 3 meses" },
  { value: "year", label: "Este año" },
  { value: "all", label: "Todo el tiempo" }
]

export default function TeacherEarningsPage() {
  const { toast } = useToast()
  const [earnings, setEarnings] = useState<TeacherEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/teacher/earnings?period=${selectedPeriod}`)
      setEarnings(response.data)
    } catch (error) {
      console.error("Error fetching earnings:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las analíticas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [selectedPeriod])

  if (loading) {
    return (
      <>
        <SessionsHeader
          title="Mis Ganancias"
          description="Revisa tus ganancias y estadísticas de sesiones"
        />
        <div className="px-4 lg:px-6 pb-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando analíticas...</p>
          </div>
        </div>
      </>
    )
  }

  if (!earnings) {
    return (
      <>
        <SessionsHeader
          title="Mis Ganancias"
          description="Revisa tus ganancias y estadísticas de sesiones"
        />
        <div className="px-4 lg:px-6 pb-6">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No hay datos de ganancias disponibles</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SessionsHeader
        title="Mis Ganancias"
        description="Revisa tus ganancias y estadísticas de sesiones"
      >
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-auto">
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
      </SessionsHeader>

      <div className="px-4 lg:px-6 pb-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${earnings.totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {earnings.totalCredits} créditos totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {earnings.completedSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Sesiones finalizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {earnings.averageRating ? earnings.averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {earnings.averageRating > 0 && (
                  <>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < Math.floor(earnings.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos por Sesión</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {earnings.completedSessions > 0 ? (earnings.totalCredits / earnings.completedSessions).toFixed(1) : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio por sesión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sesiones recientes con feedback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Sesiones Recientes y Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay sesiones recientes
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.recentSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.student.fullName} • {format(new Date(session.scheduledAt), "PPP", { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          +{session.creditsEarned} créditos
                        </Badge>
                        {session.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{session.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {session.feedback && (
                      <div className="bg-muted/50 p-3 rounded-md mt-2">
                        <p className="text-sm font-medium mb-1">Feedback del estudiante:</p>
                        <p className="text-sm text-muted-foreground">{session.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas mensuales */}
        {earnings.monthlyStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Estadísticas Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings.monthlyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{stat.month}</p>
                      <p className="text-sm text-muted-foreground">{stat.sessions} sesiones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${stat.earnings.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{stat.credits} créditos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sesiones próximas cuando no hay ganancias */}
        {earnings.completedSessions === 0 && earnings.upcomingSessions && earnings.upcomingSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Sesiones Programadas
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Aún no tienes sesiones completadas en este período, pero tienes {earnings.upcomingSessions.length} sesiones programadas.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {earnings.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.student.fullName} • {format(new Date(session.scheduledAt), "PPP 'a las' p", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                        {session.status === "confirmed" ? "Confirmada" : "Programada"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.creditsRequired} crédito{session.creditsRequired !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información de debug cuando no hay datos */}
        {earnings.completedSessions === 0 && earnings.debugInfo && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <div className="space-y-2 text-sm">
                <p><strong>Total de sesiones (todas):</strong> {earnings.debugInfo.totalSessionsAllTime}</p>
                <p><strong>Sesiones próximas:</strong> {earnings.debugInfo.upcomingSessionsCount}</p>
                <p><strong>Período consultado:</strong> {earnings.debugInfo.searchPeriod.period}</p>
                <p><strong>Desde:</strong> {format(new Date(earnings.debugInfo.searchPeriod.from), "PPP", { locale: es })}</p>
                <p><strong>Hasta:</strong> {format(new Date(earnings.debugInfo.searchPeriod.to), "PPP", { locale: es })}</p>
              </div>
              {earnings.debugInfo.totalSessionsAllTime === 0 && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-md">
                  <p className="text-sm font-medium">💡 Sugerencia:</p>
                  <p className="text-sm">
                    No tienes ninguna sesión registrada. Ve a &quot;Mi Disponibilidad&quot; para configurar tus horarios 
                    y permitir que los estudiantes reserven sesiones contigo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}