"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { Chapter } from "@prisma/client";
import { Button } from "@/components/ui/button";

import EditorText from "@/components/EditorText/EditorText";

import NavBarSliderBar from "./NavBarSliderBar/NavBarSliderBar";
import { fetchData } from "../../../../../custom/fetchData";

// Textos para soporte de múltiples idiomas
const texts = {
  es: {
    title: "Descripción de capítulo",
    editButton: "Editar descripción",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    placeholder: "Sin descripción",
    successMessage: "Capítulo actualizado",
  },
  en: {
    title: "Chapter Description",
    editButton: "Edit Description",
    cancelButton: "Cancel",
    saveButton: "Save",
    placeholder: "No description",
    successMessage: "Chapter updated",
  },
};

// Tipo de dato para el recurso `HandlerChecksItem`
interface HandlerChecksItem {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
}

// Propiedades de `EnhancedChapterDescription`
interface EnhancedChapterDescriptionProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  items: HandlerChecksItem[];
  lang?: "es" | "en";
}

export const EnhancedChapterDescription: React.FC<
  EnhancedChapterDescriptionProps
> = ({ initialData, courseId, chapterId, items, lang = "es" }) => {
  const [description, setDescription] = useState<string>(
    initialData.description || ""
  );

  const handleSave = async() => {
    toast.success(`${texts[lang].successMessage}`);
    
    const path = `/api/courses/${courseId}/chapters/${chapterId}/update`;
    const callback = () => {
      toast.success(texts[lang].successMessage);
    };

    const values = {
      ...initialData,
      description: description,
      chapterId:chapterId
    };
    
    try {
      await fetchData({ values, courseId, path, callback, method: "POST" });
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
  };


  const insertReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    toast.success(`Referencia copiada: ${reference}`);
  };

  return (
    <>
      <div className="font-medium flex  bg-[#FFFCF8] text-black px-4 mt-2 py-2 h-[60vh]">
        {/* {description ? (
          <Check className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <X className="h-5 w-5 text-red-500 mr-2" />
        )}
        <label className="font-bold mr-auto ml-2">{texts[lang].title}</label>
      </div>
      <div className="text-sm">
        {!description ? ( */}
          {/* <p className="italic text-gray-500">{texts[lang].placeholder}</p>
        ) : ( */}
        <div className="text-sm h-[40vh]">
            <NavBarSliderBar 
            items={items}
            insertReference={insertReference}
            lang={"es"}
            />
            <EditorText
              initialText={description}
              onChange={(content) => setDescription(content)}
            />
            <Button className="w-full" onClick={handleSave}>Guardar descripción</Button>
            </div>
      </div>
    </>
  );
};
