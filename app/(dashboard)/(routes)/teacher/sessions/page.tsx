"use client"

import { useState, useEffect } from "react"
import { Video, Calendar, Clock, User, Star, MessageCircle, ExternalLink, Filter, Search } from "lucide-react"
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
  meetingId?: string
  creditsRequired: number
  teacherNotes?: string
  studentNotes?: string
  rating?: number
  feedback?: string
  student: {
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

export default function TeacherSessionsPage() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [teacherNotes, setTeacherNotes] = useState("")

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
        session.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setTeacherNotes(session.teacherNotes || "")
    setIsDetailsModalOpen(true)
  }

  const saveNotes = async () => {
    if (!selectedSession) return

    await handleUpdateSession(selectedSession.id, {
      teacherNotes: teacherNotes
    })
    setIsDetailsModalOpen(false)
  }

  const startMeeting = (session: LiveSession) => {
    if (session.meetingUrl) {
      window.open(session.meetingUrl, "_blank")
    } else {
      // Aquí se podría integrar con Zoom, Google Meet, etc.
      toast({
        title: "URL de reunión no disponible",
        description: "Configura la URL de la videollamada para esta sesión"
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando sesiones...</p>
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
            Gestiona tus sesiones personalizadas programadas
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
          <p className="text-muted-foreground">No se encontraron sesiones</p>
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
                  {/* Estudiante */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{session.student.fullName}</span>
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

                  {/* Rating y feedback */}
                  {session.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{session.rating}/5 estrellas</span>
                    </div>
                  )}

                  {session.feedback && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tiene feedback</span>
                    </div>
                  )}

                  {/* Créditos */}
                  <div className="text-xs text-muted-foreground">
                    💳 {session.creditsRequired} crédito{session.creditsRequired !== 1 ? 's' : ''}
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
                        onClick={() => startMeeting(session)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Iniciar
                      </Button>
                    )}

                    {session.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateSession(session.id, { status: "confirmed" })}
                      >
                        Confirmar
                      </Button>
                    )}

                    {session.meetingUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(session.meetingUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
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
                  <label className="text-sm font-medium">Estudiante:</label>
                  <p className="text-sm">{selectedSession.student.fullName}</p>
                  <p className="text-xs text-muted-foreground">{selectedSession.student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado:</label>
                  <Badge className={getStatusColor(selectedSession.status)}>
                    {getStatusLabel(selectedSession.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notas del Profesor:</label>
                <Textarea
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Agrega notas sobre esta sesión..."
                  className="mt-1"
                />
              </div>

              {selectedSession.studentNotes && (
                <div>
                  <label className="text-sm font-medium">Notas del Estudiante:</label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedSession.studentNotes}</p>
                </div>
              )}

              {selectedSession.feedback && (
                <div>
                  <label className="text-sm font-medium">Feedback del Estudiante:</label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedSession.feedback}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={saveNotes}>
                  Guardar Notas
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}