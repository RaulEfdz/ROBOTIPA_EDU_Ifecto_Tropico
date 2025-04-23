"use client";

import React, { useState, useEffect } from "react";
import { FileQuestionIcon, ClipboardCopyIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formmatedFile } from "@/tools/formmatedFile";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Quiz } from "@/app/(dashboard)/(routes)/exams/types";
import { getAllQuizzes } from "@/app/(dashboard)/(routes)/exams/context/QuizContext";
import { formatText } from "@/utils/formatTextMS";

// Textos para soporte de múltiples idiomas
const texts = {
  es: {
    quizzesForChapter: "Quizzes para este capítulo",
    copiedMessage: "¡Copiado!",
    openQuizzes: "Abrir quizzes",
  },
  en: {
    quizzesForChapter: "Quizzes for this chapter",
    copiedMessage: "Copied!",
    openQuizzes: "Open quizzes",
  },
};

// Props para `QuizSidebar`
interface QuizSidebarProps {
  onInsertQuizReference: (reference: string) => void;
  lang: "es" | "en";
}

const QuizSidebar: React.FC<QuizSidebarProps> = ({
  onInsertQuizReference,
  lang,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Función para cargar los quizzes
  const refreshQuizzes = async () => {
    try {
      await getAllQuizzes(setQuizzes);
    } catch (error) {
      console.error("Error refreshing quizzes:", error);
    }
  };

  // Cargar quizzes al abrir el modal
  useEffect(() => {
    if (isSheetOpen) {
      refreshQuizzes();
    }
  }, [isSheetOpen]);

  const sortedQuizzes = [...quizzes].sort((a, b) => a.id.localeCompare(b.id));

  const formatTitle = (id: string) => id.replace(/ /g, "_");

  return (
    <div className="p-4">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="bg-green-500 flex items-center gap-2 text-TextCustom px-4 py-2 rounded-md hover:bg-green-600 focus:ring focus:ring-green-300 shadow-md transition duration-200"
            aria-label={texts[lang].openQuizzes}
          >
            <BookOpen className="w-5 h-5" /> {/* Ícono de un libro abierto */}
            {texts[lang].openQuizzes}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[1000px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-x-2">
              <FileQuestionIcon />
              {texts[lang].quizzesForChapter}
            </SheetTitle>
            <SheetDescription>
              <div className="mt-4">
                <ul className="space-y-2 max-h-[600px] overflow-y-auto">
                  {sortedQuizzes.length > 0 ? (
                    sortedQuizzes.map((quiz) => (
                      <li
                        key={quiz.id}
                        className="flex flex-col justify-between p-4 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-bold">
                            {formatTitle(formmatedFile(formatText(quiz.title)))}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Copiar referencia del quiz"
                            onClick={() => {
                              const formattedId = `@[Quiz_${formatText(
                                quiz.title
                              )}_&!${formatTitle(formmatedFile(quiz.id))}]`;

                              // Crear contenido enriquecido (HTML)
                              const richText = `
                                <b style="color:green; margin-block: 2vh; font-weight:bold;">
                                  <i>${formattedId}</i>
                                </b>
                              `;

                              // Copiar al portapapeles como HTML
                              navigator.clipboard.write([
                                new ClipboardItem({
                                  "text/html": new Blob([richText], {
                                    type: "text/html",
                                  }),
                                }),
                              ]);

                              toast.success(
                                `${texts[lang].copiedMessage}: ${quiz.title}`
                              );
                            }}
                          >
                            <ClipboardCopyIcon />
                          </Button>
                        </div>
                        {quiz.description && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {quiz.description}
                          </div>
                        )}
                        <span className="mt-1 text-xs text-gray-500">
                          Preguntas: {quiz.questions.length}
                          {/* - Creador:{" "} {quiz.idCreator} */}
                        </span>
                      </li>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      {lang === "es"
                        ? "No hay quizzes disponibles"
                        : "No quizzes available"}
                    </div>
                  )}
                </ul>
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default QuizSidebar;
