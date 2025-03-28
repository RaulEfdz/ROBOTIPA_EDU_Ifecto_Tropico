"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EditorText from "@/components/EditorText/EditorText";
import { fetchData } from "../../custom/fetchData";
import { Course } from "@/prisma/types";

// Textos en español e inglés
const texts = {
  es: {
    title: "Descripción de curso",
    editButton: "Editar descripción",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    placeholder: "por ejemplo, 'Este curso trata sobre...'",
    noDescription: "Sin descripción",
    successMessage: "Curso actualizado",
    errorMessage: "Ocurrió un error",
    validationMessage: "Se requiere una descripción",
  },
  en: {
    title: "Course Description",
    editButton: "Edit Description",
    cancelButton: "Cancel",
    saveButton: "Save",
    placeholder: "e.g., 'This course is about...'",
    noDescription: "No description",
    successMessage: "Course updated",
    errorMessage: "An error occurred",
    validationMessage: "Description is required",
  },
};

interface DescriptionFormProps {
  initialData: any;
  courseId: string;
  lang?: "es" | "en"; // idioma opcional, español por defecto
}

const DescriptionForm = ({
  initialData,
  courseId,
  lang = "es",
}: DescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState<string>(
    initialData.description || ""
  );

  const formSchema = z.object({
    description: z.string().min(1, { message: texts[lang].validationMessage }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData.description || "",
    },
  });

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async () => {
    try {
      const path = `/api/courses/description`; // Mantén esta línea si necesitas la ruta como variable.

      const response = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, courseId }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la solicitud");
      }

      // Si necesitas procesar la respuesta
      const result = await response.json();

      // Llama al callback si el envío fue exitoso
      toast.success(texts[lang].successMessage);
      toggleEdit();
    } catch (error) {
      console.error("Error al enviar la descripción:", error);
      toast.error("Ocurrió un error al guardar la descripción.");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {texts[lang].title}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            texts[lang].cancelButton
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {texts[lang].editButton}
            </>
          )}
        </Button>
      </div>

      <EditorText
        initialText={description}
        onChange={(value) => setDescription(value)}
      />

      <div className="flex items-center gap-x-2 mt-4">
        <Button
          onClick={onSubmit}
          disabled={!description || form.formState.isSubmitting}
          className="bg-green-600 text-white"
        >
          {texts[lang].saveButton}
        </Button>
      </div>
    </div>
  );
};

export default DescriptionForm;
