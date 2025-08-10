"use client"

import { useState, useEffect } from "react"
import { Search, Star, Clock, Calendar, User, CreditCard, Video } from "lucide-react"
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import StudentsHeader from "../_components/StudentsHeader"

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

export default function FindTeachersPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  
  // Reserva de sesión
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [studentCredits, setStudentCredits] = useState<StudentCredits | null>(null)
  const [availableDates, setAvailableDates] = useState<Date[]>([])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      
      // Obtener profesores que tienen disponibilidad activa
      const response = await axios.get("/api/users/teachers")
      
      // El endpoint retorna { success: true, teachers: [...] }
      const teachersData = response.data?.teachers || []
      
      // Mostrar todos los profesores, pero marcar cuáles tienen disponibilidad
      const teachersWithInfo = teachersData.map((teacher: any) => ({
        ...teacher,
        hasAvailability: teacher.teacherAvailability && teacher.teacherAvailability.length > 0
      }))
      
      setTeachers(teachersWithInfo)
      setFilteredTeachers(teachersWithInfo)
    } catch (error) {
      console.error("Error fetching teachers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesores",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories")
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
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

  useEffect(() => {
    fetchTeachers()
    fetchCategories()
    fetchStudentCredits()
  }, [])

  useEffect(() => {
    let filtered = teachers

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.courses.some(course => 
          course.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(teacher =>
        teacher.courses.some(course => course.category?.id === selectedCategory)
      )
    }

    setFilteredTeachers(filtered)
  }, [teachers, searchTerm, selectedCategory])

  const fetchAvailability = async (teacherId: string, date: Date) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd")
      const response = await axios.get(`/api/live-sessions/availability?teacherId=${teacherId}&date=${dateStr}`)
      setAvailableSlots(response.data)
    } catch (error) {
      console.error("Error fetching availability:", error)
      setAvailableSlots([])
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad",
        variant: "destructive"
      })
    }
  }

  const calculateAvailableDates = (teacher: Teacher, daysAhead: number = 30): Date[] => {
    const dates: Date[] = []
    const today = new Date()
    
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      
      // Verificar si este día de la semana tiene disponibilidad
      const dayOfWeek = date.getDay()
      const hasAvailability = teacher.teacherAvailability.some(
        availability => availability.dayOfWeek === dayOfWeek && availability.isActive
      )
      
      if (hasAvailability) {
        dates.push(date)
      }
    }
    
    return dates
  }

  const openBookingModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setSelectedDate(undefined)
    setAvailableSlots([])
    setSelectedSlot(null)
    
    // Calcular fechas disponibles
    const dates = calculateAvailableDates(teacher)
    setAvailableDates(dates)
    
    setIsBookingModalOpen(true)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    
    if (date && selectedTeacher) {
      fetchAvailability(selectedTeacher.id, date)
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

      console.log("🔍 [BOOKING] Sending session data:", sessionData)

      const response = await fetch("/api/live-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ [BOOKING] Server error:", response.status, errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ [BOOKING] Session created successfully:", result)

      toast({
        title: "¡Sesión reservada!",
        description: `Tu sesión con ${selectedTeacher.fullName} ha sido programada exitosamente`,
      })

      // Actualizar créditos
      fetchStudentCredits()
      
      setIsBookingModalOpen(false)
      setSelectedTeacher(null)
      setSelectedDate(undefined)
      setSelectedSlot(null)

    } catch (error: any) {
      console.error("❌ [BOOKING] Error booking session:", error)
      toast({
        title: "Error al reservar",
        description: error.message || "No se pudo reservar la sesión",
        variant: "destructive"
      })
    } finally {
      setIsBooking(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getTeacherScheduleSummary = (teacher: Teacher) => {
    if (!teacher.hasAvailability) {
      return "Sin horarios configurados"
    }
    
    const activeSchedules = teacher.teacherAvailability.filter(a => a.isActive)
    if (activeSchedules.length === 0) return "Sin horarios disponibles"
    
    const minCredits = Math.min(...activeSchedules.map(a => a.creditsPerSession))
    const minPrice = Math.min(...activeSchedules.map(a => a.pricePerCredit))
    
    return `Desde ${minCredits} crédito${minCredits !== 1 ? 's' : ''} • $${minPrice}/crédito`
  }

  if (loading) {
    return (
      <>
        <StudentsHeader
          title="Buscar Profesores"
          description="Encuentra profesores disponibles para sesiones personalizadas"
        />
        <div className="px-4 lg:px-6 pb-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Buscando profesores disponibles...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <StudentsHeader
        title="Buscar Profesores"
        description="Encuentra profesores disponibles para sesiones personalizadas"
      >
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
      </StudentsHeader>
    
    <div className="px-4 lg:px-6 pb-6">

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de profesores */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron profesores disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {teacher.fullName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <Badge variant={teacher.hasAvailability ? "outline" : "secondary"}>
                    {teacher.hasAvailability 
                      ? `${teacher.teacherAvailability.filter(a => a.isActive).length} horarios`
                      : "Sin horarios"
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Cursos */}
                  {teacher.courses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Materias:</h4>
                      <div className="flex flex-wrap gap-1">
                        {teacher.courses.slice(0, 3).map((course) => (
                          <Badge key={course.id} variant="secondary" className="text-xs">
                            {course.title}
                          </Badge>
                        ))}
                        {teacher.courses.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{teacher.courses.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Horarios disponibles */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Disponibilidad:</h4>
                    {teacher.hasAvailability ? (
                      <div className="space-y-1">
                        {teacher.teacherAvailability
                          .filter(a => a.isActive)
                          .slice(0, 3)
                          .map((availability) => (
                          <div key={availability.id} className="text-xs text-muted-foreground flex justify-between">
                            <span>
                              {DAYS_OF_WEEK[availability.dayOfWeek]}: {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                            </span>
                            <span>
                              {availability.creditsPerSession} crédito{availability.creditsPerSession !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                        {teacher.teacherAvailability.filter(a => a.isActive).length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{teacher.teacherAvailability.filter(a => a.isActive).length - 3} horarios más
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Este profesor aún no ha configurado sus horarios de disponibilidad
                      </div>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Desde: </span>
                    <span className="font-medium">{getTeacherScheduleSummary(teacher)}</span>
                  </div>

                  {teacher.hasAvailability ? (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => openBookingModal(teacher)}
                        disabled={!studentCredits || studentCredits.remainingCredits === 0}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reservar Sesión
                      </Button>

                      {(!studentCredits || studentCredits.remainingCredits === 0) && (
                        <p className="text-xs text-red-600 text-center">
                          No tienes créditos suficientes
                        </p>
                      )}
                    </>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      disabled
                    >
                      Sin horarios disponibles
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              
              {selectedTeacher && (
                <div className="mb-3 p-3 bg-muted rounded-lg text-sm">
                  <h4 className="font-medium mb-2">Horarios típicos de {selectedTeacher.fullName}:</h4>
                  <div className="space-y-1">
                    {selectedTeacher.teacherAvailability
                      .filter(a => a.isActive)
                      .map((availability, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{DAYS_OF_WEEK[availability.dayOfWeek]}</span>
                        <span>{formatTime(availability.startTime)} - {formatTime(availability.endTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-3 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Disponible</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-muted-foreground">No disponible</span>
                </span>
              </div>
              <div className="relative">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    if (date < new Date()) return true
                    // Deshabilitar días que no están en availableDates
                    return !availableDates.some(availableDate => 
                      availableDate.toDateString() === date.toDateString()
                    )
                  }}
                  modifiers={{
                    available: availableDates,
                    unavailable: (date) => {
                      if (date < new Date()) return false
                      return !availableDates.some(availableDate => 
                        availableDate.toDateString() === date.toDateString()
                      )
                    }
                  }}
                  modifiersClassNames={{
                    available: "bg-green-500 text-white hover:bg-green-600 font-medium border-2 border-green-600",
                    unavailable: "text-gray-300 cursor-not-allowed opacity-50"
                  }}
                  className="rounded-md border"
                />
                
                {availableDates.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">Este profesor no tiene horarios configurados para los próximos 30 días</p>
                    </div>
                  </div>
                )}
              </div>
              
              {availableDates.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {availableDates.length} días disponibles en los próximos 30 días
                  </div>
                  
                  {/* Próximas fechas disponibles */}
                  <div className="text-xs">
                    <p className="text-muted-foreground mb-1">Próximas fechas disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableDates.slice(0, 6).map((date, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          {format(date, "dd/MM", { locale: es })}
                        </button>
                      ))}
                      {availableDates.length > 6 && (
                        <span className="px-2 py-1 text-xs text-muted-foreground">
                          +{availableDates.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Horarios disponibles */}
            <div>
              <h3 className="font-semibold mb-3">
                {selectedDate ? "Horarios disponibles" : "Selecciona una fecha"}
              </h3>
              
              {selectedDate && availableSlots.length === 0 && (
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
    </>
  )
}