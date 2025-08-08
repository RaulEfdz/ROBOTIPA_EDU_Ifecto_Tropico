"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X, Plus, Search, Info, Tag, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchData } from "../../../custom/fetchData";
import { Badge } from "@/components/ui/badge";

const categoryFormTexts = {
  es: {
    title: "Categoría del curso",
    editButton: "Editar",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    createNew: "Crear nueva categoría",
    noCategory: "Sin categoría",
    successMessage: "Categoría actualizada",
    errorMessage: "Ocurrió un error",
    validationMessage: "Se requiere una categoría",
    hintMessage: "Selecciona o crea una categoría para organizar el curso",
    searchPlaceholder: "Buscar o crear categoría...",
    newCategoryPlaceholder: "Nueva categoría",
    noResults: "No se encontraron categorías",
    existingCategories: "Categorías existentes",
    createNewSection: "Crear nueva categoría",
    selectedCategory: "Categoría seleccionada",
    willCreate: "Se creará la categoría",
    clickToSelect: "Haz clic para seleccionar",
    clickToCreate: "Haz clic para crear",
    searchInstructions:
      "Escribe para buscar una categoría existente o crear una nueva",
  },
  en: {
    title: "Course category",
    editButton: "Edit",
    cancelButton: "Cancel",
    saveButton: "Save",
    createNew: "Create new category",
    noCategory: "No category",
    successMessage: "Category updated",
    errorMessage: "An error occurred",
    validationMessage: "Category is required",
    hintMessage: "Select or create a category to organize the course",
    searchPlaceholder: "Search or create category...",
    newCategoryPlaceholder: "New category",
    noResults: "No categories found",
    existingCategories: "Existing categories",
    createNewSection: "Create new category",
    selectedCategory: "Selected category",
    willCreate: "Will create category",
    clickToSelect: "Click to select",
    clickToCreate: "Click to create",
    searchInstructions:
      "Type to search for an existing category or create a new one",
  },
};

const formSchema = z.object({
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
});

interface Option {
  label: string;
  value: string;
}

interface CategoryFormProps {
  initialData: Course;
  courseId: string;
  lang?: "es" | "en";
}

export const CategoryForm = ({
  initialData,
  courseId,
  lang = "es",
}: CategoryFormProps) => {
  const t = categoryFormTexts[lang];
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<Option[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialData.categoryId || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // NUEVO: Permitir elegir explícitamente entre "Usar existente" o "Crear nueva"
  const [mode, setMode] = useState<"select" | "create">("select");
  // Estado para mostrar el modal de selección de categoría
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: selectedCategoryId,
      newCategoryName: "",
    },
  });

  const { isSubmitting } = form.formState;

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === selectedCategoryId),
    [selectedCategoryId, options]
  );

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, options]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/updates/category/get`);
      const json = await res.json();
      const data = json?.data as { id?: string; name: string }[] | undefined;

      const formatted = (data ?? [])
        .filter((cat) => cat.id)
        .map((cat) => ({
          label: cat.name,
          value: cat.id!,
        }));

      setOptions(formatted);
    } catch (err) {
      console.error("Error loading categories", err);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createCategory = async (name: string) => {
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, " ");
    const res = await fetch(
      `/api/courses/${courseId}/updates/category/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName }),
      }
    );

    if (!res.ok) throw new Error("Error al crear la categoría");

    const json = await res.json();
    return json?.data;
  };

  // Modifica onSubmit para recargar categorías tras crear una nueva
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.categoryId && !values.newCategoryName) {
      toast.error(t.validationMessage);
      return;
    }

    setIsSaving(true);

    try {
      let finalCategoryId = values.categoryId;

      if (!finalCategoryId && values.newCategoryName) {
        const created = await createCategory(values.newCategoryName);
        finalCategoryId = created?.id;

        if (created?.id && created?.name) {
          // Recarga todas las categorías para asegurar consistencia
          await fetchCategories();
        }
      }

      await fetchData({
        values: { categoryId: finalCategoryId },
        path: `/api/courses/${courseId}/updates/category/update`,
        method: "POST",
        courseId,
        callback: (res: any) => {
          if (res?.data?.categoryId) {
            setSelectedCategoryId(res.data.categoryId);
            form.reset({ categoryId: res.data.categoryId });
          }

          toast.success(t.successMessage, {
            duration: 2000,
            position: "bottom-right",
          });

          // Limpiar estado después de guardar
          setSearchTerm("");
          setShowDropdown(false);
          setCreateNew(false);
          router.refresh();
        },
      });
    } catch (error) {
      console.error("Category update/create error:", error);
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Agrega logs para depuración
  useEffect(() => {
    if (options.length === 0) {
    } else {
    }
  }, [options]);

  const handleSelect = (id: string) => {
    form.setValue("categoryId", id);
    form.setValue("newCategoryName", "");
    setCreateNew(false);
    setShowDropdown(false);
  };

  const handleCreateNew = () => {
    const normalized = searchTerm.trim();
    form.setValue("categoryId", "");
    form.setValue("newCategoryName", normalized);
    setCreateNew(true);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    form.setValue("categoryId", "");
    form.setValue("newCategoryName", "");
    setCreateNew(false);
    setSearchTerm("");
  };

  // Verificar si se puede crear nueva categoría
  const canCreateNew =
    searchTerm.trim().length > 0 &&
    !options.some(
      (opt) => opt.label.toLowerCase() === searchTerm.trim().toLowerCase()
    );

  // Determinar el estado actual
  const currentSelection = form.watch("categoryId");
  const newCategoryName = form.watch("newCategoryName");
  const hasSelection = currentSelection || newCategoryName;

  return (
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Modal de selección de categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-500" />
              {t.existingCategories}
            </h2>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setShowCategoryModal(false)}
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full flex items-center gap-4 px-5 py-4 text-base font-medium rounded-lg transition-colors border-2 mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 shadow-sm
                      ${
                        selectedCategoryId === option.value
                          ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-800 dark:text-primary-200"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                      }
                    `}
                    onClick={() => {
                      handleSelect(option.value);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Tag className="h-5 w-5 mr-2 text-primary-400" />
                    <span className="flex-1 truncate">{option.label}</span>
                    {selectedCategoryId === option.value && (
                      <span className="flex items-center justify-center rounded-full bg-primary-500 text-white w-7 h-7">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {t.noResults}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary-500" />
          {t.title}
        </h3>
        <span title={t.hintMessage}>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t.searchInstructions}
      </p>

      {/* Selector de modo */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={mode === "select" ? "default" : "outline"}
          className={mode === "select" ? "bg-primary-600 text-white" : ""}
          onClick={() => {
            setMode("select");
            setShowCategoryModal(true); // Mostrar modal
            setSearchTerm("");
            setCreateNew(false);
            form.setValue("newCategoryName", "");
          }}
        >
          Usar existente
        </Button>
        <Button
          type="button"
          variant={mode === "create" ? "default" : "outline"}
          className={mode === "create" ? "bg-green-600 text-white" : ""}
          onClick={() => {
            setMode("create");
            setSearchTerm("");
            setCreateNew(true);
            form.setValue("categoryId", "");
          }}
        >
          Crear nueva
        </Button>
      </div>

      {/* El resto del formulario igual, pero el input de búsqueda solo se muestra si NO está el modal */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo de creación solo si modo es create */}
          {mode === "create" && (
            <FormField
              control={form.control}
              name="newCategoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre de la nueva categoría
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t.newCategoryPlaceholder}
                      className="h-12 text-sm border-primary-300"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {/* Previsualización de selección */}
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      createNew ? "bg-green-500" : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {createNew
                        ? `${t.willCreate}: ${newCategoryName}`
                        : selectedOption
                          ? `${t.selectedCategory}: ${selectedOption.label}`
                          : t.selectedCategory}
                    </p>
                    <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      {createNew ? newCategoryName : selectedOption?.label}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Mostrar la categoría seleccionada debajo del selector si hay selección y no está en modo crear ni con el modal abierto */}
          {mode === "select" && selectedOption && !showCategoryModal && (
            <div className="mb-4 flex items-center gap-2 text-base text-primary-700 dark:text-primary-300 font-semibold animate-fade-in">
              <Tag className="h-5 w-5 text-primary-500" />
              <span>
                {t.selectedCategory}:{}
                <span className="font-bold">{selectedOption.label}</span>
              </span>
            </div>
          )}

          {/* Botón de guardar */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSaving || isSubmitting || !hasSelection}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 h-11"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{t.saveButton}</span>
                </div>
              )}
            </Button>

            {!hasSelection && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.validationMessage}
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
