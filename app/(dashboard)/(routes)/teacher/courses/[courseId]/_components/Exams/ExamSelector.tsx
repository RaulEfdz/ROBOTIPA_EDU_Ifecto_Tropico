"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
  Search, 
  CheckSquare, 
  Square, 
  BookOpen, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useExams } from "./hooks/useExams";

interface Exam {
  id: string;
  title: string;
}

interface ExamSelectorProps {
  courseId: string;
  initialExamIds?: string[];
}

export const ExamSelector: React.FC<ExamSelectorProps> = React.memo(
  ({ courseId, initialExamIds = [] }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const {
      exams,
      selected,
      setSelected,
      isLoading,
      error,
      isSaving,
      saveExams,
    } = useExams(courseId, initialExamIds);

    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const filteredExams = useMemo(
      () =>
        exams.filter((exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      [exams, searchTerm]
    );

    return (
      <div
        className={cn(
          "mt-6 border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
        )}
      >
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Gestión de Exámenes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Selecciona los exámenes que estarán disponibles en este curso
              </p>
            </div>
          </div>
          
          {/* Badge con contador */}
          <div className="flex items-center gap-2">
            <Badge variant={selected.length > 0 ? "default" : "secondary"} className="px-3 py-1">
              {selected.length} seleccionado{selected.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Barra de búsqueda y controles */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar exámenes por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || !!error}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelected([])}
              disabled={isLoading || !!error || selected.length === 0}
              className="border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Todo
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelected(filteredExams.map(exam => exam.id))}
              disabled={isLoading || !!error || filteredExams.length === 0}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Seleccionar Todo
            </Button>
          </div>
        </div>

        {/* Lista de exámenes mejorada */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600 dark:text-gray-300">Cargando exámenes...</span>
            </div>
          ) : error ? (
            <Alert className="m-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium mb-2">
                {searchTerm ? 'No se encontraron exámenes' : 'No hay exámenes disponibles'}
              </p>
              <p className="text-sm">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea exámenes primero para poder asignarlos al curso'}
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {filteredExams.map((exam, index) => {
                const isSelected = selectedSet.has(exam.id);
                return (
                  <label 
                    key={exam.id} 
                    className={cn(
                      "flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      index !== filteredExams.length - 1 && "border-b border-gray-100 dark:border-gray-700",
                      isSelected && "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelected((prev) => [...prev, exam.id]);
                        } else if (checked === false) {
                          setSelected((prev) =>
                            prev.filter((id) => id !== exam.id)
                          );
                        }
                      }}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium transition-colors",
                          isSelected 
                            ? "text-blue-900 dark:text-blue-100" 
                            : "text-gray-700 dark:text-gray-300"
                        )}>
                          {exam.title}
                        </span>
                        
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-2" />
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con información y botón de guardar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredExams.length > 0 && (
              <span>
                Mostrando {filteredExams.length} de {exams.length} exámenes disponibles
                {selected.length > 0 && (
                  <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                    • {selected.length} seleccionado{selected.length !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
            )}
          </div>
          
          <Button
            onClick={saveExams}
            disabled={isSaving || isLoading || !!error}
            className={cn(
              "transition-all duration-200",
              "bg-blue-600 hover:bg-blue-700 text-white",
              isSaving && "animate-pulse"
            )}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Guardando Cambios...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

ExamSelector.displayName = "ExamSelector";
