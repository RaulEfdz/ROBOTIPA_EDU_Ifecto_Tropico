// File: app/(dashboard)/exams/[idExam]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Toaster } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { useAttempts, useExam } from "./hook/useExamData";
import ExamTabs, { ExamFormData } from "./components/ExamTabs";
import ExamDetailHeader from "./components/ExamDetailHeader";
import { AttemptsData } from "./utils/examApi";
import AddQuestionModal from "./add/AddQuestionModal";

export default function ExamDetailPage() {
  const { idExam: examId } = useParams() as { idExam: string };
  const { exam, rawExam, error, mutate } = useExam(examId);
  const { attemptsData } = useAttempts(examId);

  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // Configuración de React Hook Form
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

  // Cuando cargue el examen, llenamos el formulario
  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description ?? "",
        duration: exam.duration ?? 60,
        isPublished: exam.isPublished ?? false,
        passingScore: exam.data?.passingScore ?? 70,
      });
    }
  }, [exam, reset]);

  // Guardar cambios generales del examen
  const onSubmit = async (data: ExamFormData) => {
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await mutate();
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-corregir respuestas faltantes
  const handleSaveProcessedExam = async () => {
    if (!exam) return;
    const questions = exam.questions.map((q) => ({
      id: q.id,
      correctAnswers: q.correctAnswers,
    }));
    try {
      const res = await fetch(
        `/api/exams/${examId}/questions/update-correct-answers`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await mutate();
    } catch (err) {
      console.error(err);
    }
  };

  // Sincronizar toggle de publicación con React Hook Form
  const handlePublishChange = (checked: boolean) =>
    setValue("isPublished", checked, { shouldDirty: true });

  const isLoading = !rawExam && !error;
  const isError = !!error;
  const hasMissing = rawExam?.questions.some((q) => !q.correctAnswers?.length);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2"></div>
        <p className="mt-2">Cargando examen…</p>
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error al cargar el examen.</p>
      </div>
    );

  return (
    <div className="p-8 space-y-6">
      <Toaster position="top-right" />

      <ExamDetailHeader
        exam={exam!}
        hasMissingCorrectAnswers={!!hasMissing}
        onCorrectAnswers={handleSaveProcessedExam}
        onSaveChanges={handleSubmit(onSubmit)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
      />

      <FormProvider {...formMethods}>
        <ExamTabs
          exam={exam!}
          attemptsData={attemptsData as AttemptsData}
          onAddQuestion={() => setAddModalOpen(true)}
          onPublishChange={handlePublishChange}
          isSubmitting={isSubmitting}
          isDirty={isDirty}
          onSubmit={handleSubmit(onSubmit)}
        />
      </FormProvider>

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onOpenChange={setAddModalOpen}
        examId={examId}
        onQuestionAdded={() => {
          mutate();
          setAddModalOpen(false);
        }}
      />
    </div>
  );
}
