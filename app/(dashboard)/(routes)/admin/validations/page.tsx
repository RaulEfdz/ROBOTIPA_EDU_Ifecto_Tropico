"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, FileCheck, Clock, CheckCircle, XCircle, Users, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { ValidationDataTable } from "./_components/ValidationDataTable";
import { ValidationStats } from "./_components/ValidationStats";

interface ValidationStats {
  NO_SUBMITTED: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  total: number;
}

interface ValidationData {
  validations: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ValidationStats;
}

export default function AdminValidationsPage() {
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchValidations = async (page = 1, status = statusFilter, search = searchQuery) => {
    try {
      setRefreshing(page === currentPage); // Solo mostrar refreshing si es la misma página
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (status !== "all") params.append("status", status);
      if (search.trim()) params.append("search", search.trim());

      const response = await fetch(`/api/admin/validations?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch validations");
      }

      const result = await response.json();
      setData(result);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching validations:", error);
      toast.error("Error al cargar las validaciones");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchValidations();
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchValidations(1, newStatus, searchQuery);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchValidations(1, statusFilter, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchValidations(page, statusFilter, searchQuery);
  };

  const handleRefresh = () => {
    fetchValidations(currentPage, statusFilter, searchQuery);
  };

  const handleValidationUpdate = () => {
    // Refrescar los datos cuando se actualiza una validación
    handleRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Cargando validaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Validaciones de Documentos</h1>
          <p className="text-muted-foreground">
            Gestiona y revisa los documentos de acreditación de los usuarios
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileCheck className="h-4 w-4 mr-2" />
          )}
          {refreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {/* Estadísticas */}
      {data && <ValidationStats stats={data.stats} />}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Filtra las validaciones por estado o busca por nombre/email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtro por estado */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="NO_SUBMITTED">Sin documento</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="APPROVED">Aprobados</SelectItem>
                  <SelectItem value="REJECTED">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div className="flex-2">
              <label className="text-sm font-medium mb-2 block">Buscar usuario</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Nombre o email del usuario..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros activos */}
          {(statusFilter !== "all" || searchQuery.trim()) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Estado: {statusFilter.replace("_", " ")}
                </Badge>
              )}
              {searchQuery.trim() && (
                <Badge variant="secondary" className="text-xs">
                  Búsqueda: {searchQuery}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                  fetchValidations(1, "all", "");
                }}
                className="h-6 px-2 text-xs"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de validaciones */}
      {data && (
        <ValidationDataTable
          validations={data.validations}
          pagination={data.pagination}
          onPageChange={handlePageChange}
          onValidationUpdate={handleValidationUpdate}
        />
      )}

      {/* Mensaje si no hay resultados */}
      {data && data.validations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No se encontraron validaciones</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter !== "all" || searchQuery.trim()
                ? "Intenta ajustar los filtros o la búsqueda"
                : "Aún no hay validaciones de documentos"
              }
            </p>
            {(statusFilter !== "all" || searchQuery.trim()) && (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                  fetchValidations(1, "all", "");
                }}
              >
                Ver todas las validaciones
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}