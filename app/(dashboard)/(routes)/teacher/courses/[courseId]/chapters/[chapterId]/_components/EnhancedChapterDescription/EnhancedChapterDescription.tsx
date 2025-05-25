"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Chapter } from "@prisma/client";

import { Button } from "@/components/ui/button";
import EditorText from "@/components/EditorText/EditorText";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const texts = {
  es: {
    title: "4 - Descripción del capítulo",
    placeholder: "Escribe aquí el contenido detallado del capítulo...",
    savingMessage: "Guardando...",
    savedMessage: "Guardado",
    errorMessage: "Ocurrió un error al guardar",
    errorHint: "Error al guardar. Cambios no guardados.",
    hintMessage:
      "Los cambios se guardan automáticamente si la opción está activa.",
    autoSaveLabel: "Auto Guardado",
    intervalLabel: "Intervalo (seg):",
    settingsTooltip: "Configurar Auto Guardado",
    resetButton: "Revertir cambios",
  },
  en: {
    title: "4 - Chapter Description",
    placeholder: "Write the detailed content of the chapter here...",
    savingMessage: "Saving...",
    savedMessage: "Saved",
    errorMessage: "An error occurred while saving",
    errorHint: "Error saving. Changes not saved.",
    hintMessage: "Changes are saved automatically if the option is enabled.",
    autoSaveLabel: "Auto Save",
    intervalLabel: "Interval (sec):",
    settingsTooltip: "Configure Auto Save",
    resetButton: "Reset Changes",
  },
};

interface EnhancedChapterDescriptionProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  lang?: "es" | "en";
}

export const EnhancedChapterDescription: React.FC<
  EnhancedChapterDescriptionProps
> = ({ initialData, courseId, chapterId, lang = "es" }) => {
  const t = texts[lang];
  const router = useRouter();

  const [description, setDescription] = useState<string>("");
  const [originalDescription, setOriginalDescription] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(3);

  const isMounted = useRef(false);

  useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem(
        `autoSaveEnabled_${chapterId}`
      );
      const storedInterval = localStorage.getItem(
        `autoSaveInterval_${chapterId}`
      );

      if (storedEnabled !== null) {
        setAutoSaveEnabled(JSON.parse(storedEnabled));
      } else {
        localStorage.setItem(
          `autoSaveEnabled_${chapterId}`,
          JSON.stringify(autoSaveEnabled)
        );
      }

      if (storedInterval !== null) {
        const interval = Number(storedInterval);
        setAutoSaveInterval(interval > 0 ? interval : 3);
      } else {
        localStorage.setItem(
          `autoSaveInterval_${chapterId}`,
          autoSaveInterval.toString()
        );
      }
    } catch (error) {
      console.error("Error reading auto-save config from localStorage:", error);
      setAutoSaveEnabled(true);
      setAutoSaveInterval(3);
    }
  }, [chapterId]);

  useEffect(() => {
    if (isMounted.current) {
      try {
        localStorage.setItem(
          `autoSaveEnabled_${chapterId}`,
          JSON.stringify(autoSaveEnabled)
        );
        localStorage.setItem(
          `autoSaveInterval_${chapterId}`,
          autoSaveInterval.toString()
        );
      } catch (error) {
        console.error("Error writing auto-save config to localStorage:", error);
      }
    }
  }, [autoSaveEnabled, autoSaveInterval, chapterId]);

  useEffect(() => {
    const loadDescriptionFromApi = async () => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/description`,
          {
            method: "GET",
          }
        );
        const data = await res.json();

        if (data?.description !== undefined && data?.description !== null) {
          setDescription(data.description);
          setOriginalDescription(data.description);
        } else {
          setDescription(initialData.description || "");
          setOriginalDescription(initialData.description || "");
        }
      } catch (error) {
        console.error("Error fetching description from API:", error);
        setDescription(initialData.description || "");
        setOriginalDescription(initialData.description || "");
      } finally {
        setIsLoading(false);
        isMounted.current = true;
      }
    };

    loadDescriptionFromApi();
  }, [courseId, chapterId, initialData.description]);

  useEffect(() => {
    if (isMounted.current) {
      setHasUnsavedChanges(description !== originalDescription);
    }
  }, [description, originalDescription]);

  const callDescriptionApi = useCallback(
    async (currentDescription: string) => {
      if (currentDescription === originalDescription) {
        setIsProcessing(false);
        setHasError(false);
        return;
      }

      setIsProcessing(true);
      setHasError(false);

      try {
        const response = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/description`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: currentDescription }),
          }
        );
        const data = await response.json();

        if (data?.description !== undefined) {
          router.refresh();
          setOriginalDescription(data.description || "");
          setHasUnsavedChanges(false);
        } else {
          toast.error(data?.message || t.errorMessage);
          setHasError(true);
        }
      } catch (err: any) {
        console.error("handleSave error:", err);
        toast.error(err?.message || t.errorMessage);
        setHasError(true);
      } finally {
        setIsProcessing(false);
      }
    },
    [courseId, chapterId, originalDescription, router, t.errorMessage]
  );

  useEffect(() => {
    if (!isMounted.current || !autoSaveEnabled) return;

    if (description !== originalDescription) {
      const timer = setTimeout(
        () => {
          callDescriptionApi(description);
        },
        Math.max(1000, autoSaveInterval * 1000)
      );

      return () => clearTimeout(timer);
    }
  }, [
    description,
    originalDescription,
    autoSaveEnabled,
    autoSaveInterval,
    callDescriptionApi,
  ]);

  const handleEditorChange = (content: string) => {
    setDescription(content);
  };

  const handleReset = async () => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/description`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data?.description !== undefined) {
        setDescription(data.description || "");
        setOriginalDescription(data.description || "");
        toast.success("Descripción restablecida correctamente.");
      } else {
        toast.error(data?.message || "No se pudo restablecer la descripción.");
      }
    } catch (err) {
      console.error("Error al resetear descripción:", err);
      toast.error("Error inesperado al resetear descripción");
    }
  };

  const getStatusIndicator = () => {
    if (isProcessing) {
      return (
        <span
          className="flex items-center text-xs text-emerald-600 dark:text-emerald-400"
          title={t.savingMessage}
        >
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          {t.savingMessage}
        </span>
      );
    }
    if (hasError) {
      return (
        <span
          className="flex items-center text-xs text-red-600 dark:text-red-500"
          title={t.errorHint}
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {t.errorMessage}
        </span>
      );
    }
    if (!hasUnsavedChanges && isMounted.current) {
      return (
        <span
          className="flex items-center text-xs text-green-600 dark:text-green-500"
          title={t.savedMessage}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-5">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Cargando descripción...
        </span>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-TextCustom dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {t.title}
        </h3>
        <div className="flex items-center space-x-3">
          <div className="h-5 w-24 flex items-center justify-end">
            {getStatusIndicator()}
          </div>
          {hasUnsavedChanges && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title={t.resetButton}
            >
              <RotateCcw className="h-4 w-4 text-primaryCustom2" />
            </Button>
          )}
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              autoSaveEnabled
                ? "bg-green-500 text-TextCustom"
                : "bg-red-500 text-TextCustom"
            }`}
          >
            {autoSaveEnabled
              ? "Auto Guardado Activado"
              : "Auto Guardado Desactivado"}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.settingsTooltip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">
                    {t.settingsTooltip}
                  </h4>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between space-x-2">
                    <Label
                      htmlFor={`autosave-switch-${chapterId}`}
                      className="text-sm flex-grow cursor-pointer"
                    >
                      {t.autoSaveLabel}
                    </Label>
                    <Switch
                      id={`autosave-switch-${chapterId}`}
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                      aria-label={t.autoSaveLabel}
                    />
                  </div>
                  {autoSaveEnabled && (
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label
                        htmlFor={`interval-input-${chapterId}`}
                        className="text-sm col-span-2"
                      >
                        {t.intervalLabel}
                      </Label>
                      <Input
                        id={`interval-input-${chapterId}`}
                        type="number"
                        min="1"
                        value={autoSaveInterval}
                        onChange={(e) =>
                          setAutoSaveInterval(
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="h-8 col-span-1 dark:bg-gray-700 dark:border-gray-600"
                        aria-label={t.intervalLabel}
                      />
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-5 flex-grow">
        <EditorText
          key={chapterId}
          initialText={description}
          onChange={handleEditorChange}
          minHeight="400px"
          placeholder={t.placeholder}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          • {t.hintMessage}
        </p>
      </div>
    </div>
  );
};
