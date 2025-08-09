"use client"

import { useState, useEffect } from "react"
import { 
  ChevronDown,
  ChevronUp, 
  MoreHorizontal,
  ArrowUpDown,
  Pin,
  PinOff,
  Star,
  StarOff,
  Eye,
  Download,
  Edit,
  Trash2,
  GripVertical,
  Filter,
  Search,
  Plus
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from "@/lib/utils"

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

interface ProtocolsDataTableProps {
  protocols: Protocol[]
  courses: Course[]
  categories: Category[]
  loading: boolean
  onProtocolsChange: (protocols: Protocol[]) => void
  onRefresh: () => void
  onDelete: (protocol: Protocol) => void
  onDownload: (protocolId: string) => void
}

const SortableRow = ({ protocol, children }: { protocol: Protocol, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: protocol.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-muted/50 transition-colors",
        isDragging && "bg-muted opacity-50",
        protocol.isPinned && "bg-blue-50 border-l-4 border-l-blue-500",
        protocol.isFeatured && "bg-amber-50 border-l-4 border-l-amber-500"
      )}
    >
      <TableCell className="w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>
      {children}
    </TableRow>
  )
}

export function ProtocolsDataTable({
  protocols: initialProtocols,
  courses,
  categories,
  loading,
  onProtocolsChange,
  onRefresh,
  onDelete,
  onDownload,
}: ProtocolsDataTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [protocols, setProtocols] = useState<Protocol[]>(initialProtocols)
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const priorityColors = {
    0: "bg-gray-100 text-gray-800",
    1: "bg-yellow-100 text-yellow-800", 
    2: "bg-red-100 text-red-800"
  }

  const priorityLabels = {
    0: "Baja",
    1: "Media", 
    2: "Alta"
  }

  useEffect(() => {
    setProtocols(initialProtocols)
  }, [initialProtocols])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = protocols.findIndex((item) => item.id === active.id)
      const newIndex = protocols.findIndex((item) => item.id === over.id)
      
      const newProtocols = arrayMove(protocols, oldIndex, newIndex)
      
      // Update order based on new positions
      const updatedProtocols = newProtocols.map((protocol, index) => ({
        ...protocol,
        order: index
      }))
      
      setProtocols(updatedProtocols)
      onProtocolsChange(updatedProtocols)
      
      try {
        // Send order updates to API
        await fetch('/api/protocols/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            protocolOrders: updatedProtocols.map(p => ({ id: p.id, order: p.order }))
          })
        })
        
        toast({
          title: "Orden actualizado",
          description: "El orden de los protocolos ha sido guardado"
        })
      } catch (error) {
        console.error('Error updating order:', error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el orden",
          variant: "destructive"
        })
      }
    }
  }

  const togglePin = async (protocolId: string) => {
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isPinned: !protocols.find(p => p.id === protocolId)?.isPinned 
        })
      })
      
      if (response.ok) {
        const updatedProtocol = await response.json()
        setProtocols(prev => prev.map(p => 
          p.id === protocolId ? { ...p, isPinned: updatedProtocol.isPinned } : p
        ))
        onRefresh()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const toggleFeatured = async (protocolId: string) => {
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isFeatured: !protocols.find(p => p.id === protocolId)?.isFeatured 
        })
      })
      
      if (response.ok) {
        const updatedProtocol = await response.json()
        setProtocols(prev => prev.map(p => 
          p.id === protocolId ? { ...p, isFeatured: updatedProtocol.isFeatured } : p
        ))
        onRefresh()
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const filteredProtocols = protocols
    .filter(protocol => {
      if (searchTerm && !protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !protocol.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (statusFilter !== "all" && protocol.status !== statusFilter) return false
      if (typeFilter !== "all" && protocol.type !== typeFilter) return false
      if (courseFilter !== "all" && protocol.course?.id !== courseFilter) return false
      if (categoryFilter !== "all" && protocol.category?.id !== categoryFilter) return false
      return true
    })
    .sort((a, b) => {
      // Pinned items always first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Then featured items
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      
      // Then by selected sort
      let aVal: any = a[sortBy as keyof Protocol]
      let bVal: any = b[sortBy as keyof Protocol]
      
      if (sortBy === "course") {
        aVal = a.course?.title || ""
        bVal = b.course?.title || ""
      } else if (sortBy === "category") {
        aVal = a.category?.name || ""
        bVal = b.category?.name || ""
      } else if (sortBy === "author") {
        aVal = a.author.fullName
        bVal = b.author.fullName
      }
      
      if (typeof aVal === "string") {
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })

  const paginatedProtocols = filteredProtocols.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredProtocols.length / itemsPerPage)

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

  const SortableHeader = ({ column, children }: { column: string, children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortBy === column && (
          sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
        {sortBy !== column && <ArrowUpDown className="h-4 w-4 opacity-50" />}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ocultar" : "Mostrar"} Filtros
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Buscar protocolos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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

              <Select value={typeFilter} onValueChange={setTypeFilter}>
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

              <Select value={courseFilter} onValueChange={setCourseFilter}>
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

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
        )}
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Cargando protocolos...</span>
            </div>
          ) : filteredProtocols.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">No se encontraron protocolos</p>
              <Button onClick={onRefresh} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear nuevo protocolo
              </Button>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={paginatedProtocols.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProtocols.length === paginatedProtocols.length && paginatedProtocols.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProtocols(paginatedProtocols.map(p => p.id))
                            } else {
                              setSelectedProtocols([])
                            }
                          }}
                        />
                      </TableHead>
                      <SortableHeader column="title">Título</SortableHeader>
                      <SortableHeader column="type">Tipo</SortableHeader>
                      <SortableHeader column="status">Estado</SortableHeader>
                      <SortableHeader column="priority">Prioridad</SortableHeader>
                      <SortableHeader column="course">Curso</SortableHeader>
                      <SortableHeader column="views">Vistas</SortableHeader>
                      <SortableHeader column="downloads">Descargas</SortableHeader>
                      <SortableHeader column="createdAt">Creado</SortableHeader>
                      <TableHead className="w-16">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProtocols.map((protocol) => (
                      <SortableRow key={protocol.id} protocol={protocol}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProtocols.includes(protocol.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProtocols([...selectedProtocols, protocol.id])
                              } else {
                                setSelectedProtocols(selectedProtocols.filter(id => id !== protocol.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {protocol.isPinned && <Pin className="h-3 w-3 text-blue-600" />}
                              {protocol.isFeatured && <Star className="h-3 w-3 text-amber-500" />}
                              <span className="font-medium line-clamp-1">{protocol.title}</span>
                            </div>
                            {protocol.description && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {protocol.description}
                              </span>
                            )}
                            <div className="flex gap-1">
                              {protocol.isPublic && (
                                <Badge variant="secondary" className="text-xs">Público</Badge>
                              )}
                              {protocol.color && (
                                <div 
                                  className="w-3 h-3 rounded-full border" 
                                  style={{ backgroundColor: protocol.color }}
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(protocol.type)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(protocol.status)}>
                            {getStatusLabel(protocol.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[protocol.priority as keyof typeof priorityColors]}>
                            {priorityLabels[protocol.priority as keyof typeof priorityLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {protocol.course?.title || "Sin curso"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{protocol.views}</TableCell>
                        <TableCell className="text-right">{protocol.downloads}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(protocol.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
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
                              <DropdownMenuItem onClick={() => onDownload(protocol.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => togglePin(protocol.id)}>
                                {protocol.isPinned ? (
                                  <>
                                    <PinOff className="h-4 w-4 mr-2" />
                                    Desfijar
                                  </>
                                ) : (
                                  <>
                                    <Pin className="h-4 w-4 mr-2" />
                                    Fijar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFeatured(protocol.id)}>
                                {protocol.isFeatured ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Quitar destacado
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Destacar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDelete(protocol)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </SortableRow>
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProtocols.length)} de {filteredProtocols.length}
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedProtocols.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm font-medium">
              {selectedProtocols.length} protocolo(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Cambiar estado
              </Button>
              <Button variant="outline" size="sm">
                Asignar curso
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                Eliminar seleccionados
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedProtocols([])}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}