"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateProtocolModal } from "./_components/CreateProtocolModal"
import { DeleteProtocolModal } from "./_components/DeleteProtocolModal"
import { useToast } from "@/hooks/use-toast"

interface Protocol {
  id: string
  title: string
  description?: string
  type: string
  status: string
  version: string
  isPublic: boolean
  downloads: number
  views: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    fullName: string
    email: string
  }
  course?: {
    id: string
    title: string
  }
  category?: {
    id: string
    name: string
  }
  _count: {
    protocolViews: number
    protocolAccess: number
  }
}

interface Course {
  id: string
  title: string
}

interface Category {
  id: string
  name: string
}

export default function ProtocolsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [protocolToDelete, setProtocolToDelete] = useState<Protocol | null>(null)

  const protocolTypes = [
    { value: "document", label: "Documento" },
    { value: "procedure", label: "Procedimiento" },
    { value: "guideline", label: "Guía" },
    { value: "policy", label: "Política" }
  ]

  const protocolStatuses = [
    { value: "draft", label: "Borrador" },
    { value: "review", label: "En revisión" },
    { value: "approved", label: "Aprobado" },
    { value: "published", label: "Publicado" },
    { value: "archived", label: "Archivado" }
  ]

  const fetchProtocols = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedType !== "all") params.append("type", selectedType)
      if (selectedStatus !== "all") params.append("status", selectedStatus)
      if (selectedCourse !== "all") params.append("courseId", selectedCourse)
      if (selectedCategory !== "all") params.append("categoryId", selectedCategory)

      const response = await axios.get(`/api/protocols?${params.toString()}`)
      setProtocols(response.data)
    } catch (error) {
      console.error("Error fetching protocols:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los protocolos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/courses")
      setCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/courses/getCourses")
      if (response.data.categories) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchProtocols()
    fetchCourses()
    fetchCategories()
  }, [selectedType, selectedStatus, selectedCourse, selectedCategory])

  const filteredProtocols = protocols.filter(protocol =>
    protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownload = async (protocolId: string) => {
    try {
      const response = await axios.post(`/api/protocols/${protocolId}/download`)
      const { downloadUrl, htmlContent, fileName } = response.data

      if (downloadUrl) {
        // Descargar archivo existente
        window.open(downloadUrl, "_blank")
      } else if (htmlContent) {
        // Crear y descargar archivo HTML
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      toast({
        title: "Descarga iniciada",
        description: "El protocolo se está descargando"
      })
    } catch (error) {
      console.error("Error downloading protocol:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el protocolo",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!protocolToDelete) return

    try {
      await axios.delete(`/api/protocols/${protocolToDelete.id}`)
      
      toast({
        title: "Protocolo eliminado",
        description: "El protocolo ha sido eliminado exitosamente"
      })
      
      setProtocols(prev => prev.filter(p => p.id !== protocolToDelete.id))
      setIsDeleteModalOpen(false)
      setProtocolToDelete(null)
    } catch (error) {
      console.error("Error deleting protocol:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el protocolo",
        variant: "destructive"
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "review": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-blue-100 text-blue-800"
      case "published": return "bg-green-100 text-green-800"
      case "archived": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    return protocolTypes.find(t => t.value === type)?.label || type
  }

  const getStatusLabel = (status: string) => {
    return protocolStatuses.find(s => s.value === status)?.label || status
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Protocolos</h1>
          <p className="text-muted-foreground">
            Gestiona documentos, procedimientos y guías
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Protocolo
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar protocolos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {protocolTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {protocolStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

      {/* Lista de protocolos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando protocolos...</p>
        </div>
      ) : filteredProtocols.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron protocolos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProtocols.map((protocol) => (
            <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {protocol.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getTypeLabel(protocol.type)} • v{protocol.version}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => router.push(`/teacher/protocols/${protocol.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/teacher/protocols/${protocol.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(protocol.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setProtocolToDelete(protocol)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeColor(protocol.status)}>
                      {getStatusLabel(protocol.status)}
                    </Badge>
                    {protocol.isPublic && (
                      <Badge variant="outline">Público</Badge>
                    )}
                  </div>
                  
                  {protocol.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {protocol.description}
                    </p>
                  )}

                  {protocol.course && (
                    <p className="text-xs text-muted-foreground">
                      📚 {protocol.course.title}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>👁 {protocol.views} vistas</span>
                    <span>⬇ {protocol.downloads} descargas</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Creado el {new Date(protocol.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateProtocolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          fetchProtocols()
        }}
        courses={courses}
        categories={categories}
      />

      <DeleteProtocolModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setProtocolToDelete(null)
        }}
        onConfirm={handleDelete}
        protocol={protocolToDelete}
      />
    </div>
  )
}