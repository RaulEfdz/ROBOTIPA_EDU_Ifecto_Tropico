// ExamDetailPage.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  FileQuestion,
  Save,
  Settings,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { Exam } from "@/prisma/types";

import AddQuestionModal from "./add/AddQuestionModal";
import ExamQuestionsTab from "./tabs/ExamQuestionsTab";
import ExamDetailsForm from "./tabs/ExamDetailsForm";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar datos");
    return res.json();
  });

export type ExamFormData = {
  title: string;
  description?: string;
  duration: number;
  isPublished: boolean;
  passingScore?: number;
};

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.idExam as string;
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  const {
    data: exam,
    error,
    mutate,
  } = useSWR<Exam>(examId ? `/api/exams/${examId}` : null, fetcher);

  const formMethods = useForm<ExamFormData>({
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      isPublished: false,
      passingScore: 70,
    },
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = formMethods;

  React.useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description || "",
        duration: exam.duration ?? 0,
        isPublished: exam.isPublished || false,
        passingScore: exam.data?.passingScore || 70,
      });
    }
  }, [exam, reset]);

  const onSubmit = async (data: ExamFormData) => {
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el examen");
      }

      toast.success("Examen actualizado con éxito");
      await mutate();
    } catch (err: any) {
      console.error("Error updating exam:", err);
      toast.error(err.message || "Error al actualizar examen");
    }
  };

  const handlePublishChange = (checked: boolean) => {
    setValue("isPublished", checked, { shouldDirty: true });
  };

  const handleQuestionAdded = async () => {
    await mutate();
    setIsAddQuestionModalOpen(false);
  };

  const isLoading = !exam && !error;
  const isError = !!error;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-gray-200 mb-4"></div>
          <p>Cargando examen...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p>
            No se pudo cargar el examen. Verifica el ID o intenta de nuevo más
            tarde.
          </p>
          <Button asChild className="mt-4">
            <Link href="/exams">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver a la lista de exámenes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/exams">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{exam?.title}</h1>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              exam?.isPublished
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            }`}
          >
            {exam?.isPublished ? "Publicado" : "Borrador"}
          </span>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isSubmitting}
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <Separator />

      <Tabs defaultValue="preguntas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preguntas">
            <FileQuestion className="w-4 h-4 mr-1" /> Preguntas
          </TabsTrigger>
          <TabsTrigger value="detalles">
            <Settings className="w-4 h-4 mr-1" /> Detalles
          </TabsTrigger>
          <TabsTrigger value="intentos">
            <Users className="w-4 h-4 mr-1" /> Intentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preguntas">
          <ExamQuestionsTab
            questions={exam?.questions || []}
            examId={examId}
            onQuestionsChange={() => mutate()}
            onOpenAddModal={() => setIsAddQuestionModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="detalles">
          <FormProvider {...formMethods}>
            <ExamDetailsForm
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              onSubmit={handleSubmit(onSubmit)}
              isPublished={!!exam?.isPublished}
              handlePublishChange={handlePublishChange}
            />
          </FormProvider>
        </TabsContent>

        <TabsContent value="intentos">
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No hay intentos registrados para este examen.</p>
            {!exam?.isPublished && (
              <p className="mt-2">
                Publica el examen para permitir que los estudiantes lo realicen.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onOpenChange={setIsAddQuestionModalOpen}
        examId={examId}
        onQuestionAdded={handleQuestionAdded}
      />
    </div>
  );
}
