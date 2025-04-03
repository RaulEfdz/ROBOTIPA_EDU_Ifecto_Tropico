"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircleIcon, CheckCircle2 } from "lucide-react";

const texts = {
  es: {
    title: "¿Qué formatos de nombres están permitidos?",
    noteNoDots: "No se deben usar puntos en los nombres de archivo.",
    noteSpacesAllowed: "Los espacios están permitidos.",
    allowedExamplesTitle: "Ejemplos de nombres de archivo permitidos:",
    allowedExample1: "1 - documento_sin_puntos.txt",
    allowedExample2: "A - imagen_sin_puntos.jpg",
    notAllowedExamplesTitle: "Ejemplos de nombres de archivo con puntos (no permitidos):",
    notAllowedExample1: "1. archivo.con.puntos.pdf",
    notAllowedExample2: "A. imagen.con.puntos.png",
  },
  en: {
    title: "What name formats are allowed?",
    noteNoDots: "Dots should not be used in file names.",
    noteSpacesAllowed: "Spaces are allowed.",
    allowedExamplesTitle: "Examples of allowed file names:",
    allowedExample1: "1 - document_without_dots.txt",
    allowedExample2: "A - image_without_dots.jpg",
    notAllowedExamplesTitle: "Examples of file names with dots (not allowed):",
    notAllowedExample1: "1. file.with.dots.pdf",
    notAllowedExample2: "A. image.with.dots.png",
  },
};

type Lang = "es" | "en";

interface NameFormatsProps {
  lang?: Lang;
}

const NameFormats: React.FC<NameFormatsProps> = ({ lang = "es" }) => {
  const t = texts[lang];

  return (
    <div className="mt-6">
      <Accordion type="single" collapsible className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-850">
        <AccordionItem value="name-formats">
          <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:no-underline">
            {t.title}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 space-y-3">
            <p className="flex items-center text-red-500 dark:text-red-400">
              <AlertCircleIcon className="h-4 w-4 mr-2" />
              {t.noteNoDots}
            </p>
            <p className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t.noteSpacesAllowed}
            </p>

            <div>
              <h3 className="font-semibold mb-1">{t.allowedExamplesTitle}</h3>
              <ul className="ml-4 space-y-1">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  {t.allowedExample1}
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  {t.allowedExample2}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mt-4 mb-1">{t.notAllowedExamplesTitle}</h3>
              <ul className="ml-4 space-y-1">
                <li className="flex items-center">
                  <AlertCircleIcon className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                  {t.notAllowedExample1}
                </li>
                <li className="flex items-center">
                  <AlertCircleIcon className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                  {t.notAllowedExample2}
                </li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NameFormats;
