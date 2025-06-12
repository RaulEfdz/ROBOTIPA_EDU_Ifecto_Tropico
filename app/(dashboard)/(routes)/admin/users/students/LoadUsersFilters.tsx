"use client";

import { useEffect, useState } from "react";
import { User } from "@/prisma/types";
import { toast } from "sonner";
import TeacherFilters from "./components/Filters";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { columns } from "./components/Table/columns/Columns";
import TeacherDataTable from "./components/Table/DataTable";
import NewTeacherDialog from "./components/create/NewDialog";
import NewstudentDialog from "./components/create/NewDialog";

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
      const response = await fetch("/api/users/students", {
        cache: "no-store",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error cargando Estudiantes");
      }
      const json = await response.json();
      setData(json.students);
      setFilteredData(json.students);
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
    await loadUsersFilters(); // Refresca la lista de Estudiantes
  };

  // Calcular estadísticas generales
  const overallStats = {
    totalStudents: filteredData.length,
    activeStudents: filteredData.filter(s => s.isActive).length,
    studentsWithCourses: filteredData.filter(s => (s as any).studentStats?.totalCourses > 0).length,
    averageProgressAllStudents: filteredData.length > 0
      ? Math.round(
          filteredData.reduce((sum, s) => sum + ((s as any).studentStats?.averageProgress || 0), 0) / 
          filteredData.length
        )
      : 0,
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
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

      {/* Tarjetas de resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Estudiantes</div>
          <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
          <div className="text-xs text-gray-400">
            {overallStats.activeStudents} activos
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Con Cursos</div>
          <div className="text-2xl font-bold">{overallStats.studentsWithCourses}</div>
          <div className="text-xs text-gray-400">
            {overallStats.totalStudents > 0 
              ? `${Math.round((overallStats.studentsWithCourses / overallStats.totalStudents) * 100)}%`
              : '0%'
            } del total
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Progreso Promedio</div>
          <div className="text-2xl font-bold">{overallStats.averageProgressAllStudents}%</div>
          <div className="text-xs text-gray-400">
            En todos los cursos
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Estudiantes Destacados</div>
          <div className="text-2xl font-bold">
            {filteredData.filter(s => (s as any).studentStats?.averageProgress >= 80).length}
          </div>
          <div className="text-xs text-gray-400">
            Progreso ≥ 80%
          </div>
        </div>
      </div>

      <TeacherFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
          <p>Cargando Estudiantes...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Mostrando {filteredData.length} de {data.length} Estudiantes
          </div>
          <TeacherDataTable columns={columns} data={filteredData} />
          {filteredData.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No se encontraron Estudiantes con los filtros aplicados
            </div>
          )}
        </>
      )}

      {/* Diálogo para crear Nuevo */}
      <NewstudentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onstudentCreated={handleTeacherCreated}
      />
    </div>
  );
}
