"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import { PlusCircle, RefreshCw, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Exam } from "@/prisma/types";
import NewExamModal from "./NewExamModal"; // Importamos el componente modal

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExamManagement() {
  // Carga de datos con SWR
  const { data: exams, error, mutate } = useSWR<Exam[]>("/api/exams", fetcher);

  // Estados
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Filtrar exámenes basado en el estado de búsqueda, memoizado para rendimiento
  const filtered = useMemo(
    () =>
      exams?.filter((ex) =>
        ex.title.toLowerCase().includes(search.toLowerCase())
      ) ?? [],
    [exams, search]
  );

  // Función para manejar la eliminación de un examen
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este examen? Esta acción es irreversible."
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/exams/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el examen");
      }

      toast.success("Examen eliminado con éxito");
      await mutate();
    } catch (err: any) {
      console.error("Error deleting exam:", err);
      toast.error(err.message || "Error al eliminar examen");
    }
  };

  // Función para refrescar manualmente los datos
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
      toast.success("Datos actualizados");
    } catch (err: any) {
      console.error("Error refreshing exams:", err);
      toast.error(err.message || "Error al actualizar los datos");
    } finally {
      setRefreshing(false);
    }
  };

  // Callback para cuando se crea un nuevo examen
  const handleExamCreated = async () => {
    await mutate();
    setIsNewDialogOpen(false);
  };

  // Lógica de renderizado
  const isLoading = !exams && !error;
  const isError = !!error;
  const hasFilteredResults = filtered.length > 0;

  return (
    <div className="p-8 space-y-6">
      <Toaster position="top-right" />

      {/* Encabezado y Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-extrabold">Gestión de Exámenes</h1>
        <div className="flex space-x-2">
          {/* Botón Refrescar */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Actualizando..." : "Actualizar"}
          </Button>

          {/* Componente Modal (solo pasamos el estado de apertura) */}
          <NewExamModal
            isOpen={isNewDialogOpen}
            onOpenChange={setIsNewDialogOpen}
            onExamCreated={handleExamCreated}
          />

          {/* Botón para abrir el modal */}
          <Button onClick={() => setIsNewDialogOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-1" />
            Nuevo Examen
          </Button>
        </div>
      </div>

      {/* Campo de búsqueda */}
      <Input
        placeholder="Buscar examen por título..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Tabla de exámenes */}
      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[120px]">Duración</TableHead>
              <TableHead className="w-[100px]">Preguntas</TableHead>
              <TableHead className="w-[100px]">Intentos</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead className="w-[150px]">Creado</TableHead>
              <TableHead className="text-center w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-red-500"
                >
                  Error al cargar los exámenes. Intenta actualizar.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800 dark:border-gray-200 mb-2"></div>
                  <p>Cargando exámenes...</p>
                </TableCell>
              </TableRow>
            ) : !hasFilteredResults ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 space-y-2 text-gray-500"
                >
                  {search ? (
                    <p>
                      No se encontraron exámenes que coincidan con la búsqueda
                      {search}.
                    </p>
                  ) : (
                    <>
                      <p>No hay exámenes disponibles.</p>
                      <Button
                        onClick={() => setIsNewDialogOpen(true)}
                        size="sm"
                      >
                        <PlusCircle className="w-4 h-4 mr-1" />
                        Crear primer examen
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((exam) => (
                <TableRow key={exam.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exam.description || "-"}
                  </TableCell>
                  <TableCell>{exam.duration} min</TableCell>
                  <TableCell>{exam.questions?.length ?? 0}</TableCell>
                  <TableCell>{exam.attempts?.length ?? 0}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        exam.isPublished
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {exam.isPublished ? "Publicado" : "Borrador"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {exam.createdAt
                      ? format(new Date(exam.createdAt), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="flex justify-center space-x-1">
                    <Button
                      size="icon"
                      variant="outline"
                      asChild
                      title="Ver/Editar"
                    >
                      <a href={`/exams/${exam.id}`}>
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(exam.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
