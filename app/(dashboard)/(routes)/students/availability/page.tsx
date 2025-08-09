"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, User, CreditCard, Video, Search } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: string
  fullName: string
  email: string
  hasAvailability: boolean
  courses: Array<{
    id: string
    title: string
    category?: {
      id: string
      name: string
    }
  }>
  teacherAvailability: Array<{
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    sessionDuration: number
    creditsPerSession: number
    pricePerCredit: number
    isActive: boolean
  }>
}

interface AvailableSlot {
  startTime: string
  endTime: string
  duration: number
  creditsRequired: number
  pricePerCredit: number
}

interface StudentCredits {
  remainingCredits: number
  totalCredits: number
  usedCredits: number
}

const DAYS_OF_WEEK = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
]

interface WeeklyAvailability {
  [key: number]: Array<{
    teacherId: string
    teacherName: string
    startTime: string
    endTime: string
    duration: number
    creditsRequired: number
    pricePerCredit: number
    courses: string[]
  }>
}

export default function StudentAvailabilityPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [studentCredits, setStudentCredits] = useState<StudentCredits | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchTeachersAndAvailability = async () => {
    try {
      setLoading(true)
      
      const response = await axios.get("/api/users/teachers")
      const teachersData = response.data?.teachers || []
      
      const teachersWithInfo = teachersData.map((teacher: any) => ({
        ...teacher,
        hasAvailability: teacher.teacherAvailability && teacher.teacherAvailability.length > 0
      }))
      
      setTeachers(teachersWithInfo)

      // Procesar disponibilidad semanal
      const weekly: WeeklyAvailability = {}
      
      teachersWithInfo.forEach((teacher: Teacher) => {
        if (teacher.hasAvailability) {
          teacher.teacherAvailability
            .filter(a => a.isActive)
            .forEach(availability => {
              if (!weekly[availability.dayOfWeek]) {
                weekly[availability.dayOfWeek] = []
              }
              
              weekly[availability.dayOfWeek].push({
                teacherId: teacher.id,
                teacherName: teacher.fullName,
                startTime: availability.startTime,
                endTime: availability.endTime,
                duration: availability.sessionDuration,
                creditsRequired: availability.creditsPerSession,
                pricePerCredit: availability.pricePerCredit,
                courses: teacher.courses.map(c => c.title)
              })
            })
        }
      })

      // Ordenar por hora de inicio
      Object.keys(weekly).forEach(day => {
        weekly[parseInt(day)].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })

      setWeeklyAvailability(weekly)
      
    } catch (error) {
      console.error("Error fetching teachers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentCredits = async () => {
    try {
      const response = await axios.get("/api/live-sessions/credits")
      setStudentCredits(response.data)
    } catch (error) {
      console.error("Error fetching student credits:", error)
    }
  }

  const fetchAvailabilityForDate = async (teacherId: string, date: Date) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd")
      const response = await axios.get(`/api/live-sessions/availability?teacherId=${teacherId}&date=${dateStr}`)
      setAvailableSlots(response.data)
    } catch (error) {
      console.error("Error fetching availability:", error)
      setAvailableSlots([])
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad para esta fecha",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchTeachersAndAvailability()
    fetchStudentCredits()
  }, [])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const openBookingModal = (teacherId: string, teacherName: string) => {
    const teacher = teachers.find(t => t.id === teacherId)
    if (teacher) {
      setSelectedTeacher(teacher)
      setSelectedSlot(null)
      setAvailableSlots([])
      setIsBookingModalOpen(true)
      fetchAvailabilityForDate(teacherId, selectedDate)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      if (selectedTeacher) {
        fetchAvailabilityForDate(selectedTeacher.id, date)
      }
    }
  }

  const bookSession = async () => {
    if (!selectedTeacher || !selectedSlot || !selectedDate) return

    try {
      setIsBooking(true)

      const sessionData = {
        title: `Sesión con ${selectedTeacher.fullName}`,
        description: `Sesión personalizada programada`,
        type: "consultation",
        teacherId: selectedTeacher.id,
        scheduledAt: selectedSlot.startTime,
        duration: selectedSlot.duration,
        creditsRequired: selectedSlot.creditsRequired
      }

      await axios.post("/api/live-sessions", sessionData)

      toast({
        title: "¡Sesión reservada!",
        description: `Tu sesión con ${selectedTeacher.fullName} ha sido programada exitosamente`,
      })

      fetchStudentCredits()
      setIsBookingModalOpen(false)
      setSelectedTeacher(null)
      setSelectedSlot(null)

    } catch (error: any) {
      console.error("Error booking session:", error)
      toast({
        title: "Error al reservar",
        description: error.response?.data?.error || "No se pudo reservar la sesión",
        variant: "destructive"
      })
    } finally {
      setIsBooking(false)
    }
  }

  const filteredAvailability = (daySchedules: typeof weeklyAvailability[0]) => {
    if (!searchTerm) return daySchedules
    
    return daySchedules.filter(schedule =>
      schedule.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.courses.some(course => 
        course.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando horarios disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Horarios Disponibles</h1>
          <p className="text-muted-foreground">
            Explora los horarios disponibles de todos los profesores
          </p>
        </div>
        {studentCredits && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {studentCredits.remainingCredits}
            </div>
            <div className="text-sm text-muted-foreground">
              créditos disponibles
            </div>
          </div>
        )}
      </div>

      {/* Filtro de búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar por profesor o materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vista semanal de horarios */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => (
          <Card key={dayIndex} className="min-h-[300px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center">
                {dayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyAvailability[dayIndex] ? (
                <div className="space-y-3">
                  {filteredAvailability(weeklyAvailability[dayIndex]).map((schedule, index) => (
                    <div
                      key={`${schedule.teacherId}-${index}`}
                      className="p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => openBookingModal(schedule.teacherId, schedule.teacherName)}
                    >
                      <div className="flex items-center gap-1 mb-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium truncate">
                            {schedule.teacherName}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Duración:</span>
                          <span className="text-xs">{schedule.duration} min</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Créditos:</span>
                          <Badge variant="secondary" className="text-xs">
                            {schedule.creditsRequired}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Precio:</span>
                          <span className="text-xs">${schedule.pricePerCredit}/crédito</span>
                        </div>
                        
                        {schedule.courses.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">Materias:</div>
                            <div className="flex flex-wrap gap-1">
                              {schedule.courses.slice(0, 2).map((course, courseIndex) => (
                                <Badge key={courseIndex} variant="outline" className="text-xs">
                                  {course.length > 15 ? `${course.substring(0, 15)}...` : course}
                                </Badge>
                              ))}
                              {schedule.courses.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{schedule.courses.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <Button size="sm" className="w-full">
                          <Calendar className="h-3 w-3 mr-1" />
                          Reservar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sin horarios disponibles
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resumen de Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {teachers.filter(t => t.hasAvailability).length}
              </div>
              <div className="text-sm text-muted-foreground">Profesores Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(weeklyAvailability).flat().length}
              </div>
              <div className="text-sm text-muted-foreground">Horarios Semanales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(Object.values(weeklyAvailability).flat().reduce((acc, s) => acc + s.duration, 0) / Math.max(Object.values(weeklyAvailability).flat().length, 1))}
              </div>
              <div className="text-sm text-muted-foreground">Duración Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {studentCredits?.remainingCredits || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tus Créditos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de reserva */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Reservar sesión con {selectedTeacher?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector de fecha */}
            <div>
              <h3 className="font-semibold mb-3">Selecciona una fecha</h3>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {/* Horarios disponibles */}
            <div>
              <h3 className="font-semibold mb-3">
                Horarios disponibles para {format(selectedDate, "PPP", { locale: es })}
              </h3>
              
              {availableSlots.length === 0 && (
                <p className="text-muted-foreground">
                  No hay horarios disponibles para esta fecha
                </p>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-colors ${
                      selectedSlot === slot ? "ring-2 ring-primary" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {format(new Date(slot.startTime), "p", { locale: es })} - {format(new Date(slot.endTime), "p", { locale: es })}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {slot.duration} minutos
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span className="text-sm font-medium">
                              {slot.creditsRequired} crédito{slot.creditsRequired !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${(slot.creditsRequired * slot.pricePerCredit).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Resumen de la reserva:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Profesor:</span>
                        <span>{selectedTeacher?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{format(selectedDate!, "PPP", { locale: es })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hora:</span>
                        <span>{format(new Date(selectedSlot.startTime), "p", { locale: es })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <span>{selectedSlot.duration} minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Costo:</span>
                        <span>{selectedSlot.creditsRequired} crédito{selectedSlot.creditsRequired !== 1 ? 's' : ''}</span>
                      </div>
                      {studentCredits && (
                        <div className="flex justify-between">
                          <span>Créditos restantes:</span>
                          <span>{studentCredits.remainingCredits - selectedSlot.creditsRequired}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsBookingModalOpen(false)}
                      disabled={isBooking}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={bookSession}
                      disabled={isBooking || !studentCredits || studentCredits.remainingCredits < selectedSlot.creditsRequired}
                      className="flex-1"
                    >
                      {isBooking ? "Reservando..." : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Reservar Sesión
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}