"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Check, X, ArrowRight, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Course } from "@prisma/client";

import {
  Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchData } from "../../../custom/fetchData";

// Textos centralizados
const categoryFormTexts = {
  es: {
    title: "4 - Categoría del curso",
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
    title: "4 - Course category",
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData.categoryId || "");
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
    () => options.find(opt => opt.value === selectedCategoryId),
    [selectedCategoryId, options]
  );

  const filteredOptions = useMemo(() =>
    options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm, options]
  );

  const isNewCategory = useMemo(() =>
    searchTerm.trim() !== "" &&
    !options.some(opt =>
      opt.label.trim().toLowerCase() === searchTerm.trim().toLowerCase()
    ), [searchTerm, options]
  );

  const toggleEdit = () => {
    form.reset({ categoryId: selectedCategoryId, newCategoryName: "" });
    setSearchTerm("");
    setShowDropdown(false);
    setCreateNew(false);
    setIsEditing(prev => !prev);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/updates/category/get`);
      const json = await res.json();
      const data = json?.data as { id?: string; name: string }[] | undefined;

      const formatted = (data ?? [])
        .filter(cat => cat.id)
        .map(cat => ({
          label: cat.name,
          value: cat.id!,
        }));

      setOptions(formatted);
    } catch (err) {
      console.error("Error loading categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [courseId]);

  const createCategory = async (name: string) => {
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, " ");
    const res = await fetch(`/api/courses/${courseId}/updates/category/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: normalizedName }),
    });

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
          setOptions(prev => [...prev, { value: created.id, label: created.name }]);
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
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.title}
        </h3>
        {!isEditing && (
          <Button onClick={toggleEdit} variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {selectedOption?.label || <em className="text-gray-400">{t.noCategory}</em>}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!createNew ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10 h-10 text-sm"
                />
                {showDropdown && (
                  <div className="absolute mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md z-10">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map(option => (
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
                          {t.createNew}: <span className="font-medium">{searchTerm}</span>
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
              <Button type="button" onClick={toggleEdit} variant="outline" size="icon" className="h-10 w-10">
                <X className="h-4 w-4 text-gray-500" />
              </Button>
              <Button type="submit" disabled={isSaving || isSubmitting} size="icon" className="h-10 w-10 bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              • {t.hintMessage}
            </p>

            {(form.watch("categoryId") || form.watch("newCategoryName")) && (
              <div className="text-xs text-gray-500 dark:text-gray-400 italic pt-1">
                {t.title}:{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {createNew
                    ? form.watch("newCategoryName")
                    : options.find(opt => opt.value === form.watch("categoryId"))?.label || ""}
                </span>
              </div>
            )}
          </form>
        </Form>
      )}

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>{selectedOption?.label || t.noCategory}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              <span>ID: {courseId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
