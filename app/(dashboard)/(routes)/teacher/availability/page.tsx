"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, Settings, Trash2, Edit } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AvailabilityForm } from "./_components/AvailabilityForm"
import { useToast } from "@/hooks/use-toast"

interface TeacherAvailability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  sessionDuration: number
  maxSessionsPerDay?: number
  creditsPerSession: number
  pricePerCredit: number
  isActive: boolean
  isRecurring: boolean
  blackoutDates?: string[]
  createdAt: string
  updatedAt: string
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes", 
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
]

export default function TeacherAvailabilityPage() {
  const { toast } = useToast()
  const [availability, setAvailability] = useState<TeacherAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<TeacherAvailability | null>(null)

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/live-sessions/availability")
      setAvailability(response.data)
    } catch (error) {
      console.error("Error fetching availability:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  const handleCreateAvailability = async (data: any) => {
    try {
      await axios.post("/api/live-sessions/availability", data)
      toast({
        title: "Disponibilidad creada",
        description: "La disponibilidad ha sido configurada exitosamente"
      })
      setIsCreateModalOpen(false)
      fetchAvailability()
    } catch (error: any) {
      console.error("Error creating availability:", error)
      console.error("Error response:", error.response?.data)
      toast({
        title: "Error al crear disponibilidad",
        description: error.response?.data?.error || `Error ${error.response?.status}: ${error.message}`,
        variant: "destructive"
      })
    }
  }

  const handleUpdateAvailability = async (data: any) => {
    try {
      await axios.put("/api/live-sessions/availability", {
        availabilityId: editingAvailability?.id,
        ...data
      })
      toast({
        title: "Disponibilidad actualizada",
        description: "Los cambios han sido guardados exitosamente"
      })
      setEditingAvailability(null)
      fetchAvailability()
    } catch (error: any) {
      console.error("Error updating availability:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo actualizar la disponibilidad",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta disponibilidad?")) {
      return
    }

    try {
      await axios.put("/api/live-sessions/availability", {
        availabilityId,
        isActive: false
      })
      toast({
        title: "Disponibilidad eliminada",
        description: "La disponibilidad ha sido desactivada"
      })
      fetchAvailability()
    } catch (error: any) {
      console.error("Error deleting availability:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo eliminar la disponibilidad",
        variant: "destructive"
      })
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const groupedAvailability = availability.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = []
    }
    acc[item.dayOfWeek].push(item)
    return acc
  }, {} as Record<number, TeacherAvailability[]>)

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando disponibilidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold">Mi Disponibilidad</h1>
          <p className="text-muted-foreground mt-1">
            Configura tus horarios disponibles para sesiones personalizadas
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden z-50">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl">Agregar Nueva Disponibilidad</DialogTitle>
            </DialogHeader>
            <AvailabilityForm
              onSubmit={handleCreateAvailability}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Vista móvil: Lista vertical */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{dayName}</span>
                  {groupedAvailability[dayIndex] && (
                    <Badge variant="outline">
                      {groupedAvailability[dayIndex].filter(item => item.isActive).length} horarios
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupedAvailability[dayIndex] ? (
                  <div className="space-y-3">
                    {groupedAvailability[dayIndex]
                      .filter(item => item.isActive)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg bg-background hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingAvailability(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteAvailability(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duración:</span>
                            <span>{item.sessionDuration} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Créditos:</span>
                            <Badge variant="secondary" className="text-xs">
                              {item.creditsPerSession}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio:</span>
                            <span>${item.pricePerCredit}/crédito</span>
                          </div>
                          {item.maxSessionsPerDay && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Máx sesiones:</span>
                              <span>{item.maxSessionsPerDay}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Sin horarios configurados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Vista desktop: Grid de 7 columnas */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => (
          <Card key={dayIndex} className="min-h-[300px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-center">
                {dayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {groupedAvailability[dayIndex] ? (
                <div className="space-y-2">
                  {groupedAvailability[dayIndex]
                    .filter(item => item.isActive)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded-md bg-background hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs font-medium leading-tight">
                            {formatTime(item.startTime)}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => setEditingAvailability(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteAvailability(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dur:</span>
                          <span>{item.sessionDuration}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Créditos:</span>
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            {item.creditsPerSession}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Precio:</span>
                          <span>${item.pricePerCredit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-6 w-6 text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Sin horarios configurados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de edición */}
      <Dialog open={!!editingAvailability} onOpenChange={() => setEditingAvailability(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden z-50">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl">Editar Disponibilidad</DialogTitle>
          </DialogHeader>
          {editingAvailability && (
            <AvailabilityForm
              initialData={editingAvailability}
              onSubmit={handleUpdateAvailability}
              onCancel={() => setEditingAvailability(null)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Resumen */}
      {availability.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Resumen de Disponibilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {availability.filter(a => a.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Horarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(availability.reduce((acc, a) => acc + a.creditsPerSession, 0) / availability.length) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Créditos Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(availability.reduce((acc, a) => acc + a.sessionDuration, 0) / availability.length) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Minutos Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${Math.round((availability.reduce((acc, a) => acc + a.pricePerCredit, 0) / availability.length) * 100) / 100 || 0}
                </div>
                <div className="text-sm text-muted-foreground">Precio Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}