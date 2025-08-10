"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, Shield, Eye, Edit, Trash2, UserCheck, UserX, MoreHorizontal } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import RoleGuard from "@/components/security/RoleGuard"

interface User {
  id: string
  email: string
  fullName: string
  role: string
  roleLevel: number
  isActive: boolean
  createdAt: string
  lastLogin?: string
  sessionsCount: number
  totalEarnings?: number
}

const ROLE_FILTERS = [
  { value: "all", label: "Todos los roles" },
  { value: "student", label: "Estudiantes" },
  { value: "teacher", label: "Profesores" },
  { value: "admin", label: "Administradores" },
  { value: "super_admin", label: "Super Administradores" }
]

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" }
]

function UserManagementPageContent() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin")

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/admin/users")
      setUsers(response.data.users)
      setFilteredUsers(response.data.users)
      setCurrentUserRole(response.data.currentUserRole)
    } catch (error: any) {
      console.error("Error fetching users:", error)
      if (error.response?.status === 403) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para gestionar usuarios",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter(user => user.isActive === isActive)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-red-100 text-red-800 border-red-300"
      case "admin": return "bg-purple-100 text-purple-800 border-purple-300"
      case "teacher": return "bg-blue-100 text-blue-800 border-blue-300"
      case "student": return "bg-green-100 text-green-800 border-green-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin": return "Super Admin"
      case "admin": return "Administrador"
      case "teacher": return "Profesor"
      case "student": return "Estudiante"
      default: return role
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, {
        isActive: !currentStatus
      })
      
      toast({
        title: "Estado actualizado",
        description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`
      })
      
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.reason || "No se pudo actualizar el estado",
        variant: "destructive"
      })
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const canManageUser = (targetUser: User) => {
    // Solo super_admin puede gestionar otros admins
    if (targetUser.role === "admin" && currentUserRole !== "super_admin") {
      return false
    }
    // Solo super_admin puede gestionar super_admin
    if (targetUser.role === "super_admin" && currentUserRole !== "super_admin") {
      return false
    }
    return true
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        </div>
        <p className="text-muted-foreground">
          Administrar todos los usuarios del sistema
        </p>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            🔒 Módulo Administrativo - Acceso Restringido
          </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTERS.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Sesiones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLogin 
                        ? format(new Date(user.lastLogin), "PPP", { locale: es })
                        : "Nunca"
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      {user.sessionsCount}
                      {user.totalEarnings && (
                        <div className="text-xs text-muted-foreground">
                          ${user.totalEarnings.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        {canManageUser(user) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <p className="text-sm">{selectedUser.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {getRoleLabel(selectedUser.role)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <p className="text-sm">
                    {selectedUser.isActive ? "✅ Activo" : "❌ Inactivo"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha de Registro</label>
                  <p className="text-sm">
                    {format(new Date(selectedUser.createdAt), "PPP", { locale: es })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Última Actividad</label>
                  <p className="text-sm">
                    {selectedUser.lastLogin 
                      ? format(new Date(selectedUser.lastLogin), "PPP", { locale: es })
                      : "Nunca"
                    }
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Estadísticas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sesiones Totales</label>
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.sessionsCount}</p>
                  </div>
                  {selectedUser.totalEarnings && (
                    <div>
                      <label className="text-sm font-medium">Ganancias Totales</label>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedUser.totalEarnings.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <RoleGuard 
      adminOnly={true}
      fallbackPath="/"
      showError={true}
    >
      <UserManagementPageContent />
    </RoleGuard>
  )
}