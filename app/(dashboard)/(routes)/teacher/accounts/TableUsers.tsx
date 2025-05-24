"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import EditUserForm from "./modalEditUser";
import { UpdateUser } from "./handler/update";
import toast from "react-hot-toast";
import { User } from "@/prisma/types";
import { translateRole } from "@/utils/roles/translate";

type VisibleColumns = Partial<Record<keyof User, boolean>>;

export interface TableUsersProps {
  users: User[];
}

const TableUsers = ({ users }: TableUsersProps) => {
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    id: true,
    email: true,
    fullName: true,
    username: true,
    phone: true,
    customRole: true,
    provider: true,
    lastSignInAt: true,
    metadata: true,
    isActive: true,
    isBanned: true,
    isDeleted: true,
    additionalStatus: true,
    createdAt: true,
    updatedAt: true,
    courses: true,
    purchases: true,
    userProgress: true,
    invoices: true,
    examAttempts: true,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const toggleColumn = (column: keyof User) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleSave = async (
    updatedUserData: Pick<User, "customRole" | "isActive">
  ) => {
    if (selectedUser) {
      const updatedUser: User = {
        ...selectedUser,
        ...updatedUserData,
        updatedAt: new Date(),
      };

      try {
        await UpdateUser(updatedUser);
        toast.success("Usuario actualizado con éxito.");
        setSelectedUser(null);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? `Error al actualizar el usuario: ${error.message}`
            : "Error inesperado al actualizar el usuario"
        );
      }
    }
  };

  const handleCancel = () => setSelectedUser(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mx-2">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Usuarios Registrados</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="h-[50vh] overflow-y-auto">
              {Object.keys(visibleColumns).map((column) => (
                <DropdownMenuCheckboxItem
                  className="capitalize cursor-pointer"
                  key={column}
                  checked={visibleColumns[column as keyof User]}
                  onCheckedChange={() => toggleColumn(column as keyof User)}
                >
                  {column.replace(/([A-Z])/g, " $1")}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[70vh]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {visibleColumns.fullName && (
                    <TableHead>Nombre Completo</TableHead>
                  )}
                  {visibleColumns.email && <TableHead>Email</TableHead>}
                  {visibleColumns.customRole && <TableHead>Rol</TableHead>}
                  {visibleColumns.phone && <TableHead>Teléfono</TableHead>}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {visibleColumns.fullName && (
                        <TableCell>{user.fullName}</TableCell>
                      )}
                      {visibleColumns.email && (
                        <TableCell>{user.email}</TableCell>
                      )}
                      {visibleColumns.customRole && (
                        <TableCell>{translateRole(user.customRole)}</TableCell>
                      )}
                      {visibleColumns.phone && (
                        <TableCell>{user.phone}</TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedUser(user)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <EditUserForm
          user={selectedUser}
          open={!!selectedUser}
          onSave={handleSave}
          onCancel={handleCancel}
          visibleColumns={visibleColumns}
        />
      )}
    </motion.div>
  );
};

export default TableUsers;
