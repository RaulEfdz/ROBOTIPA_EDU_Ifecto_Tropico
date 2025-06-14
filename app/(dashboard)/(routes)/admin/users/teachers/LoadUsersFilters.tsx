"use client";

import { useEffect, useState } from "react";
import { User } from "@/prisma/types";
import { toast } from "sonner";
import TeacherFilters from "./components/Filters";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import UsersFilterstatsDashboard from "./components/Stats/StatsDashboard";
import { columns } from "./components/Table/columns/Columns";
import TeacherDataTable from "./components/Table/DataTable";
import NewTeacherDialog from "./components/create/NewTeacherDialog";

export default function LoadUsersFilters() {
  const [data, setData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para el diálogo

  useEffect(() => {
    loadUsersFilters();
  }, []);

  async function loadUsersFilters() {
    try {
      setLoading(true);
      const response = await fetch("/api/users/teachers", {
        cache: "no-store",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error cargando profesores");
      }
      const json = await response.json();
      setData(json.teachers);
      setFilteredData(json.teachers);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = ({
    searchTerm,
    status,
  }: {
    searchTerm: string;
    status?: string;
  }) => {
    let filtered = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (teacher) =>
          teacher.fullName?.toLowerCase().includes(term) ||
          teacher.email?.toLowerCase().includes(term)
      );
    }

    if (status) {
      filtered = filtered.filter(
        (teacher) =>
          (status === "active" && teacher.isActive) ||
          (status === "inactive" && !teacher.isActive)
      );
    }

    setFilteredData(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsersFilters();
    toast.success("Datos actualizados");
    setRefreshing(false);
  };

  // Función para manejar la creación de un profesor
  const handleTeacherCreated = async () => {
    await loadUsersFilters(); // Refresca la lista de profesores
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Profesores</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <UsersFilterstatsDashboard />

      <TeacherFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
          <p>Cargando profesores...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Mostrando {filteredData.length} de {data.length} profesores
          </div>
          <TeacherDataTable columns={columns} data={filteredData} />
          {filteredData.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No se encontraron profesores con los filtros aplicados
            </div>
          )}
        </>
      )}

      {/* Diálogo para crear Nuevo */}
      <NewTeacherDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTeacherCreated={handleTeacherCreated}
      />
    </div>
  );
}
