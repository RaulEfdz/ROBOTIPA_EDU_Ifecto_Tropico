"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Check, X, ArrowRight, Plus, Search, Info } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchData } from "../../../custom/fetchData";
import { Badge } from "@/components/ui/badge";

// Textos centralizados
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
    noResults: "No hay categorías disponibles",
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
    noResults: "No categories available",
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

  const [options, setOptions] = useState<Option[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialData.categoryId || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const isNewCategory = useMemo(
    () =>
      searchTerm.trim() !== "" &&
      !options.some(
        (opt) =>
          opt.label.trim().toLowerCase() === searchTerm.trim().toLowerCase()
      ),
    [searchTerm, options]
  );

  const toggleEdit = () => {
    form.reset({ categoryId: selectedCategoryId, newCategoryName: "" });
    setSearchTerm("");
    setShowDropdown(false);
    setCreateNew(false);
    setIsEditing((prev) => !prev);
  };

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
          setOptions((prev) => [
            ...prev,
            { value: created.id, label: created.name },
          ]);
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

          toggleEdit();
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

  const handleSelect = (id: string) => {
    form.setValue("categoryId", id);
    form.setValue("newCategoryName", "");
    setCreateNew(false);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleCreateNew = () => {
    const normalized = searchTerm.trim().toLowerCase().replace(/\s+/g, " ");
    form.setValue("categoryId", "");
    form.setValue("newCategoryName", normalized);
    setCreateNew(true);
    setShowDropdown(false);
  };

  return (
    <div className="mb-6 bg-TextCustom dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{t.title}</span>
            <span title={t.hintMessage}>
              <Info className="w-4 h-4 text-emerald-500" />
            </span>
          </h3>
          {selectedOption?.label ? (
            <Badge className="bg-emerald-100 text-emerald-700 text-base px-3 py-1 ml-2 animate-pulse">
              Completado
            </Badge>
          ) : (
            <Badge className="bg-gray-200 text-gray-600 text-base px-3 py-1 ml-2 animate-pulse">
              Pendiente
            </Badge>
          )}
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg h-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        {t.hintMessage}
      </p>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!createNew ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10 h-10 text-sm"
                />
                {showDropdown && (
                  <div className="absolute mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-TextCustom dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md z-10">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className="cursor-pointer px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
                        >
                          {option.label}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        <Button
                          onClick={handleCreateNew}
                          variant="ghost"
                          className="w-full flex items-center justify-start gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t.createNew}:{" "}
                          <span className="font-medium">{searchTerm}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <FormField
                control={form.control}
                name="newCategoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t.newCategoryPlaceholder}
                        className="pl-10 h-10 text-sm border-blue-300"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={toggleEdit}
                variant="outline"
                size="icon"
                className="h-10 w-10"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isSubmitting}
                size="icon"
                className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-TextCustom border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-TextCustom" />
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              • {t.hintMessage}
            </p>

            {(form.watch("categoryId") || form.watch("newCategoryName")) && (
              <div className="text-xs text-gray-500 dark:text-gray-400 italic pt-1">
                {t.title}:{" "}
                <span className="font-semibold text-gray-800 dark:text-TextCustom">
                  {createNew
                    ? form.watch("newCategoryName")
                    : options.find(
                        (opt) => opt.value === form.watch("categoryId")
                      )?.label || ""}
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mt-4">
              <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {selectedOption?.label || t.noCategory}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
