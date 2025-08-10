"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  User, 
  Link as LinkIcon, 
  Video, 
  Loader2,
  ExternalLink,
  Sparkles
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: string
  title: string
  description?: string
  scheduledAt: string
  duration: number
  status: string
  student: {
    fullName: string
    email: string
  }
  meetingUrl?: string
  meetingId?: string
}

interface SessionConfirmModalProps {
  session: Session | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (sessionData: {
    meetingUrl?: string
    meetingId?: string
    teacherNotes?: string
  }) => Promise<void>
}

export default function SessionConfirmModal({ 
  session, 
  isOpen, 
  onClose, 
  onConfirm 
}: SessionConfirmModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingMeet, setGeneratingMeet] = useState(false)
  
  // Estados del formulario
  const [meetingUrl, setMeetingUrl] = useState(session?.meetingUrl || "")
  const [meetingId, setMeetingId] = useState(session?.meetingId || "")
  const [teacherNotes, setTeacherNotes] = useState("")

  if (!session) return null

  // Función para extraer el Meeting ID del link de Google Meet
  const extractMeetingId = (url: string) => {
    try {
      // Patrones comunes de Google Meet URLs:
      // https://meet.google.com/abc-defg-hij
      // https://meet.google.com/lookup/abc123def?authuser=0&hs=179
      const meetUrl = new URL(url)
      if (meetUrl.hostname === 'meet.google.com') {
        const pathname = meetUrl.pathname.replace('/lookup/', '').replace('/', '')
        // Si hay parámetros, tomar solo la parte antes del ?
        const meetingId = pathname.split('?')[0]
        return meetingId
      }
    } catch (error) {
      console.log('Error extracting meeting ID:', error)
    }
    return ""
  }

  // Actualizar Meeting ID automáticamente cuando cambia la URL
  const handleUrlChange = (url: string) => {
    setMeetingUrl(url)
    const extractedId = extractMeetingId(url)
    setMeetingId(extractedId)
  }

  const handleConfirm = async () => {
    if (!meetingUrl.trim()) {
      toast({
        title: "Link de reunión requerido",
        description: "Debes agregar un link de Google Meet para confirmar la sesión",
        variant: "destructive"
      })
      return
    }

    // Validar que sea un link válido
    try {
      new URL(meetingUrl)
    } catch (error) {
      toast({
        title: "Link inválido",
        description: "Por favor ingresa un link válido de Google Meet",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await onConfirm({
        meetingUrl: meetingUrl.trim(),
        meetingId: meetingId.trim() || undefined,
        teacherNotes: teacherNotes.trim() || undefined
      })
      
      toast({
        title: "Sesión confirmada",
        description: "El estudiante recibirá el link de la reunión"
      })
      
      onClose()
    } catch (error) {
      toast({
        title: "Error al confirmar",
        description: "No se pudo confirmar la sesión",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateGoogleMeetLink = async () => {
    setGeneratingMeet(true)
    try {
      // TODO: Implementar API de Google Meet
      // Por ahora, generar un link de ejemplo
      const meetId = `meet-${Date.now()}`
      const generatedUrl = `https://meet.google.com/${meetId}`
      
      setMeetingUrl(generatedUrl)
      setMeetingId(meetId)
      
      toast({
        title: "Link generado",
        description: "Se ha generado automáticamente el link de Google Meet"
      })
    } catch (error) {
      toast({
        title: "Error al generar",
        description: "No se pudo generar el link automáticamente. Usa la opción manual.",
        variant: "destructive"
      })
    } finally {
      setGeneratingMeet(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Sesión</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la sesión */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{session.title}</span>
                <Badge variant="secondary">{session.status}</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(session.scheduledAt), "PPP", { locale: es })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(session.scheduledAt), "p", { locale: es })}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>Estudiante: {session.student.fullName} ({session.student.email})</span>
              </div>
            </div>
          </div>

          {/* Configuración de Google Meet */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Google Meet</h3>
              {/* Botón de generación automática oculto temporalmente */}
              {false && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateGoogleMeetLink}
                    disabled={generatingMeet}
                  >
                    {generatingMeet ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generar Automático
                  </Button>
                </div>
              )}
            </div>

            {/* URL de la reunión */}
            <div className="space-y-2">
              <Label htmlFor="meetingUrl">Link de Google Meet *</Label>
              <div className="flex gap-2">
                <Input
                  id="meetingUrl"
                  value={meetingUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="flex-1"
                />
                {meetingUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(meetingUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Pega el link de Google Meet de tu reunión
              </p>
            </div>

            {/* Meeting ID (automático) */}
            {meetingId && (
              <div className="space-y-2">
                <Label htmlFor="meetingId">Meeting ID (extraído automáticamente)</Label>
                <Input
                  id="meetingId"
                  value={meetingId}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Este ID se extrajo automáticamente del link de Google Meet
                </p>
              </div>
            )}
          </div>

          {/* Notas del profesor */}
          <div className="space-y-2">
            <Label htmlFor="teacherNotes">Notas para el estudiante (opcional)</Label>
            <Textarea
              id="teacherNotes"
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Instrucciones adicionales, materiales a preparar, etc."
              rows={3}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Confirmar Sesión
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}