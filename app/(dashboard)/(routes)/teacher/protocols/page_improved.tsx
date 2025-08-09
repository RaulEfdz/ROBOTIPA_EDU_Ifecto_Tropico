"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw, BarChart3, Filter } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateProtocolModal } from "./_components/CreateProtocolModal"
import { DeleteProtocolModal } from "./_components/DeleteProtocolModal"
import { ProtocolsDataTable } from "./_components/ProtocolsDataTable"
import { useToast } from "@/hooks/use-toast"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

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
  order: number
  priority: number
  isFeatured: boolean
  isPinned: boolean
  color?: string
  rating?: number
  ratingCount: number
  shareCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
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

interface ProtocolStats {
  totalProtocols: number
  publishedProtocols: number
  draftProtocols: number
  totalViews: number
  totalDownloads: number
  avgRating: number
}

export default function ImprovedProtocolsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<ProtocolStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [protocolToDelete, setProtocolToDelete] = useState<Protocol | null>(null)
  const [activeTab, setActiveTab] = useState("table")

  const fetchProtocols = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/protocols')
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
      const response = await axios.get("/api/admin/courses")
      setCourses(response.data.courses)
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

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/protocols/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchProtocols()
    fetchCourses()
    fetchCategories()
    fetchStats()
  }, [])

  const handleDownload = async (protocolId: string) => {
    try {
      const response = await axios.post(`/api/protocols/${protocolId}/download`)
      const { downloadUrl, htmlContent, fileName } = response.data

      if (downloadUrl) {
        window.open(downloadUrl, "_blank")
      } else if (htmlContent) {
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
      
      // Refresh stats after download
      fetchStats()
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
      fetchStats()
    } catch (error) {
      console.error("Error deleting protocol:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el protocolo",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = () => {
    fetchProtocols()
    fetchStats()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Protocolos</h1>
          <p className="text-muted-foreground mt-1">
            Administra documentos, procedimientos y guías con herramientas avanzadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Protocolo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProtocols}</div>
              <p className="text-xs text-muted-foreground">protocolos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {stats.totalProtocols > 0 ? Math.round((stats.publishedProtocols / stats.totalProtocols) * 100) : 0}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.publishedProtocols}</div>
              <p className="text-xs text-muted-foreground">activos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <Badge variant="outline" className="text-xs">
                {stats.totalProtocols > 0 ? Math.round((stats.draftProtocols / stats.totalProtocols) * 100) : 0}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.draftProtocols}</div>
              <p className="text-xs text-muted-foreground">por revisar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vistas</CardTitle>
              <div className="text-xs text-muted-foreground">👁</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">visualizaciones</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Descargas</CardTitle>
              <div className="text-xs text-muted-foreground">⬇</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">descargas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación</CardTitle>
              <div className="text-xs text-muted-foreground">⭐</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating ? stats.avgRating.toFixed(1) : "N/A"}</div>
              <p className="text-xs text-muted-foreground">promedio</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
          <TabsTrigger value="cards">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <ProtocolsDataTable
            protocols={protocols}
            courses={courses}
            categories={categories}
            loading={loading}
            onProtocolsChange={setProtocols}
            onRefresh={handleRefresh}
            onDelete={(protocol) => {
              setProtocolToDelete(protocol)
              setIsDeleteModalOpen(true)
            }}
            onDownload={handleDownload}
          />
        </TabsContent>
        
        <TabsContent value="cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Card view will be implemented here */}
            <Card className="flex items-center justify-center h-48 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground">Vista de tarjetas</p>
                <p className="text-sm text-muted-foreground mt-1">Próximamente</p>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="kanban">
          <div className="flex gap-4">
            {/* Kanban view will be implemented here */}
            <Card className="flex-1 flex items-center justify-center h-96 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground">Vista Kanban</p>
                <p className="text-sm text-muted-foreground mt-1">Próximamente</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateProtocolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          fetchProtocols()
          fetchStats()
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