"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, CreditCard, Download, Filter, Search, Eye, CheckCircle } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import RoleGuard from "@/components/security/RoleGuard"

interface TeacherPayment {
  teacherId: string
  teacherName: string
  teacherEmail: string
  totalCredits: number
  totalEarnings: number
  completedSessions: number
  lastPaymentDate?: string
  pendingAmount: number
  sessions: {
    id: string
    title: string
    scheduledAt: string
    creditsRequired: number
    earnings: number
    student: {
      fullName: string
    }
  }[]
}

const PERIOD_OPTIONS = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Últimos 3 meses" },
  { value: "year", label: "Este año" }
]

function AdminTeacherPaymentsPageContent() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<TeacherPayment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<TeacherPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherPayment | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/admin/teacher-payments?period=${selectedPeriod}`)
      setPayments(response.data)
      setFilteredPayments(response.data)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de pagos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [selectedPeriod])

  useEffect(() => {
    let filtered = payments
    
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.teacherEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm])

  const handleViewDetails = (teacher: TeacherPayment) => {
    setSelectedTeacher(teacher)
    setIsDetailsModalOpen(true)
  }

  const handleMarkAsPaid = async (teacherId: string) => {
    try {
      await axios.post(`/api/admin/teacher-payments/${teacherId}/mark-paid`)
      toast({
        title: "Pago registrado",
        description: "El pago ha sido marcado como completado"
      })
      fetchPayments()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el pago",
        variant: "destructive"
      })
    }
  }

  const handleExportPayments = async () => {
    try {
      const response = await axios.get(`/api/admin/teacher-payments/export?period=${selectedPeriod}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `pagos-profesores-${selectedPeriod}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast({
        title: "Exportación exitosa",
        description: "El archivo CSV ha sido descargado"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar los datos",
        variant: "destructive"
      })
    }
  }

  const totalPending = filteredPayments.reduce((sum, p) => sum + p.pendingAmount, 0)
  const totalCredits = filteredPayments.reduce((sum, p) => sum + p.totalCredits, 0)
  const totalSessions = filteredPayments.reduce((sum, p) => sum + p.completedSessions, 0)

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando datos de pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pagos a Profesores</h1>
          <p className="text-muted-foreground">
            Gestiona los pagos y ganancias de los profesores
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPayments} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCredits} créditos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con ganancias pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar profesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">
                {filteredPayments.length} profesor{filteredPayments.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de profesores */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.teacherId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{payment.teacherName}</h3>
                    <Badge variant={payment.pendingAmount > 0 ? "destructive" : "secondary"}>
                      {payment.pendingAmount > 0 ? "Pago Pendiente" : "Al día"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{payment.teacherEmail}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Créditos:</span>
                      <p className="font-medium">{payment.totalCredits}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sesiones:</span>
                      <p className="font-medium">{payment.completedSessions}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Ganado:</span>
                      <p className="font-medium text-green-600">${payment.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pendiente:</span>
                      <p className="font-medium text-red-600">${payment.pendingAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(payment)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalles
                  </Button>
                  {payment.pendingAmount > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsPaid(payment.teacherId)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar Pagado
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Ganancias - {selectedTeacher?.teacherName}</DialogTitle>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Total de Créditos</p>
                  <p className="text-2xl font-bold">{selectedTeacher.totalCredits}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Total Pendiente</p>
                  <p className="text-2xl font-bold text-red-600">${selectedTeacher.pendingAmount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sesiones Completadas</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTeacher.sessions.map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.student.fullName} • {format(new Date(session.scheduledAt), "PPP", { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${session.earnings.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{session.creditsRequired} créditos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminTeacherPaymentsPage() {
  return (
    <RoleGuard 
      adminOnly={true}
      fallbackPath="/"
      showError={true}
    >
      <AdminTeacherPaymentsPageContent />
    </RoleGuard>
  )
}