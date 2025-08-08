"use client"

import { useState, useEffect } from "react"
import { Video, Calendar, Clock, User, Star, MessageCircle, CreditCard, Filter, Search } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface LiveSession {
  id: string
  title: string
  description?: string
  type: string
  status: string
  scheduledAt: string
  duration: number
  meetingUrl?: string
  creditsRequired: number
  teacherNotes?: string
  studentNotes?: string
  rating?: number
  feedback?: string
  teacher: {
    id: string
    fullName: string
    email: string
  }
  course?: {
    id: string
    title: string
  }
  createdAt: string
}

const SESSION_STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "scheduled", label: "Programada" },
  { value: "confirmed", label: "Confirmada" },
  { value: "in_progress", label: "En progreso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "no_show", label: "No se presentó" }
]

const SESSION_TYPES = [
  { value: "all", label: "Todos los tipos" },
  { value: "consultation", label: "Consulta" },
  { value: "tutoring", label: "Tutoría" },
  { value: "mentoring", label: "Mentoría" },
  { value: "support", label: "Soporte" },
  { value: "interview", label: "Entrevista" }
]

export default function StudentSessionsPage() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [studentNotes, setStudentNotes] = useState("")
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState<number>(0)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/live-sessions")
      setSessions(response.data)
      setFilteredSessions(response.data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las sesiones",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    let filtered = sessions

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (selectedStatus !== "all") {
      filtered = filtered.filter(session => session.status === selectedStatus)
    }

    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter(session => session.type === selectedType)
    }

    setFilteredSessions(filtered)
  }, [sessions, searchTerm, selectedStatus, selectedType])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "confirmed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "no_show": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    return SESSION_STATUSES.find(s => s.value === status)?.label || status
  }

  const getTypeLabel = (type: string) => {
    return SESSION_TYPES.find(t => t.value === type)?.label || type
  }

  const handleUpdateSession = async (sessionId: string, updates: any) => {
    try {
      await axios.patch(`/api/live-sessions/${sessionId}`, updates)
      toast({
        title: "Sesión actualizada",
        description: "Los cambios han sido guardados"
      })
      fetchSessions()
    } catch (error) {
      console.error("Error updating session:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la sesión",
        variant: "destructive"
      })
    }
  }

  const openSessionDetails = (session: LiveSession) => {
    setSelectedSession(session)
    setStudentNotes(session.studentNotes || "")
    setFeedback(session.feedback || "")
    setRating(session.rating || 0)
    setIsDetailsModalOpen(true)
  }

  const saveFeedback = async () => {
    if (!selectedSession) return

    await handleUpdateSession(selectedSession.id, {
      studentNotes,
      feedback,
      rating: rating > 0 ? rating : undefined
    })
    setIsDetailsModalOpen(false)
  }

  const joinMeeting = (session: LiveSession) => {
    if (session.meetingUrl) {
      window.open(session.meetingUrl, "_blank")
    } else {
      toast({
        title: "Reunión no disponible",
        description: "El profesor aún no ha configurado la URL de la videollamada"
      })
    }
  }

  const cancelSession = async (sessionId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta sesión?")) {
      return
    }

    try {
      await axios.delete(`/api/live-sessions/${sessionId}`)
      toast({
        title: "Sesión cancelada",
        description: "La sesión ha sido cancelada y tus créditos han sido refundados"
      })
      fetchSessions()
    } catch (error: any) {
      console.error("Error cancelling session:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo cancelar la sesión",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tus sesiones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Sesiones</h1>
          <p className="text-muted-foreground">
            Gestiona tus sesiones personalizadas con profesores
          </p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar sesiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">
                {filteredSessions.length} sesión{filteredSessions.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de sesiones */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No tienes sesiones programadas</p>
          <p className="text-sm text-muted-foreground mt-2">
            Ve a &quot;Buscar Profesores&quot; para programar tu primera sesión
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
            .map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {session.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getTypeLabel(session.type)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusLabel(session.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Profesor */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{session.teacher.fullName}</span>
                  </div>

                  {/* Fecha y hora */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(session.scheduledAt), "PPP", { locale: es })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(session.scheduledAt), "p", { locale: es })} 
                      <span className="text-muted-foreground"> • {session.duration} min</span>
                    </span>
                  </div>

                  {/* Curso relacionado */}
                  {session.course && (
                    <p className="text-xs text-muted-foreground">
                      📚 {session.course.title}
                    </p>
                  )}

                  {/* Rating dado */}
                  {session.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">Calificaste: {session.rating}/5 estrellas</span>
                    </div>
                  )}

                  {/* Créditos */}
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {session.creditsRequired} crédito{session.creditsRequired !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openSessionDetails(session)}
                    >
                      Ver Detalles
                    </Button>
                    
                    {session.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => joinMeeting(session)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Unirse
                      </Button>
                    )}

                    {["scheduled", "confirmed"].includes(session.status) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelSession(session.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Sesión</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedSession.title}</h3>
                <p className="text-muted-foreground">{selectedSession.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Profesor:</label>
                  <p className="text-sm">{selectedSession.teacher.fullName}</p>
                  <p className="text-xs text-muted-foreground">{selectedSession.teacher.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado:</label>
                  <Badge className={getStatusColor(selectedSession.status)}>
                    {getStatusLabel(selectedSession.status)}
                  </Badge>
                </div>
              </div>

              {selectedSession.teacherNotes && (
                <div>
                  <label className="text-sm font-medium">Notas del Profesor:</label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedSession.teacherNotes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Tus Notas:</label>
                <Textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Agrega tus notas sobre esta sesión..."
                  className="mt-1"
                />
              </div>

              {selectedSession.status === "completed" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Calificación (1-5 estrellas):</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Feedback:</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="¿Cómo fue tu experiencia con esta sesión?"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={saveFeedback}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}