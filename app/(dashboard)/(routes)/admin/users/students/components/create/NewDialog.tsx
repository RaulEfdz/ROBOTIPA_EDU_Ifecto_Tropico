"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { translateRole } from "@/utils/roles/translate";
import { User } from "@/prisma/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

// 🔗 RUTAS API
const USERS_API = "/api/users";
const UPDATE_ROLE_API = "/api/users/update/roles/students";

interface NewstudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onstudentCreated?: () => void;
}

const roleColors: Record<string, string> = {
  student:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  teacher:
    "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  admin:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  default:
    "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export default function NewstudentDialog({
  isOpen,
  onClose,
  onstudentCreated,
}: NewstudentDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("default");

  useEffect(() => {
    if (!isOpen) {
      setUsers([]);
      setSelectedUserId("");
      setSearchTerm("");
      setActiveTab("default");
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(USERS_API);
        if (!res.ok) throw new Error("Error al obtener los usuarios");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar los usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const handleSelectUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (
      user &&
      user.customRole?.toLowerCase() === translateRole("student").toLowerCase()
    ) {
      toast.error("Este usuario ya es un Estudiantes", {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }
    setSelectedUserId(userId);
  };

  const updateUserRole = async (id: string, role: string) => {
    try {
      const res = await fetch(UPDATE_ROLE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, customRole: role }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.error || "Error desconocido al actualizar el rol";
        throw new Error(errorMessage);
      }

      toast.success(data.message || `Rol actualizado correctamente`);
      onClose();
      setSelectedUserId("");
      if (onstudentCreated) onstudentCreated();
    } catch (err: any) {
      console.error("Error updating user role:", err);
      toast.error(err.message || "No se pudo actualizar el rol del usuario");
    }
  };

  const handleConfirm = () => {
    if (!selectedUserId) {
      toast.error("Por favor selecciona un usuario");
      return;
    }

    const selectedUser = users.find((u) => u.id === selectedUserId);
    if (!selectedUser) {
      toast.error("Usuario no encontrado");
      return;
    }

    updateUserRole(selectedUser.id, selectedUser.customRole || "");
  };

  const getRoleColor = (role: string) => roleColors[role] || roleColors.default;

  const filteredUsers = users.filter((user) => {
    const fullName = user.fullName?.toLowerCase() || "";
    const userRole =
      translateRole(user.customRole || "")?.toLowerCase() || "default";
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "default") {
      return (
        !["student", "teacher", "student"].includes(userRole) && matchesSearch
      );
    }

    return userRole === activeTab && matchesSearch;
  });

  const isUserstudent = (user: User) => {
    return translateRole(user.customRole || "").toLowerCase() === "student";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Seleccionar Nuevo Estudiantes
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar usuario por nombre..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="default"
          className="w-full"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="default">Visitantes</TabsTrigger>
            <TabsTrigger value="admin">Administradores</TabsTrigger>
            <TabsTrigger value="teacher">Profesores</TabsTrigger>
            <TabsTrigger value="student">Estudiantes</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
                {filteredUsers.map((user) => {
                  const userRole =
                    translateRole(user.customRole || "")?.toLowerCase() ||
                    "default";
                  const isstudent = isUserstudent(user);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      className={`p-4 border rounded-lg transition-all relative
                        ${
                          isstudent
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer hover:shadow-md"
                        }
                        ${
                          selectedUserId === user.id && !isstudent
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500"
                            : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      role="button"
                      aria-pressed={selectedUserId === user.id}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <Image
                            src={user.metadata?.avatar || "/logo.png"}
                            alt={user.fullName || "User Avatar"}
                            width={68}
                            height={68}
                            className="rounded-full object-cover"
                          />
                          {selectedUserId === user.id && !isstudent && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          )}
                          {isstudent && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-white">
                              <AlertCircle
                                className="w-3 h-3"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-center line-clamp-1 mt-1">
                          {user.fullName || "Usuario Desconocido"}
                        </h3>
                        <Badge
                          className={`mt-2 text-xs font-medium ${getRoleColor(
                            userRole
                          )}`}
                        >
                          {translateRole(user.customRole || "") || "Otros"}
                        </Badge>
                        {isstudent && (
                          <span className="text-xs text-red-500 mt-1">
                            Ya es Estudiantes
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {isLoading
                  ? "Cargando..."
                  : "No se encontraron usuarios que coincidan con la búsqueda o filtro."}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedUserId}
            className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
          >
            Confirmar Selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
