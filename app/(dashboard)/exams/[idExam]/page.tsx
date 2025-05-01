// // ExamDetailPage.tsx
// "use client";

// import React, { useState } from "react";
// import { useParams } from "next/navigation";
// import useSWR from "swr";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { ChevronLeft, FileQuestion, Save, Settings, Users } from "lucide-react";
// import Link from "next/link";
// import { useForm, FormProvider } from "react-hook-form";
// import { toast, Toaster } from "sonner";
// import { Exam } from "@/prisma/types";

// import AddQuestionModal from "./add/AddQuestionModal";
// import ExamQuestionsTab from "./tabs/ExamQuestionsTab";
// import ExamDetailsForm from "./tabs/ExamDetailsForm";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const fetcher = (url: string) =>
//   fetch(url).then((res) => {
//     if (!res.ok) throw new Error("Error al cargar datos");
//     return res.json();
//   });

// export type ExamFormData = {
//   title: string;
//   description?: string;
//   duration: number;
//   isPublished: boolean;
//   passingScore?: number;
// };

// const getLetterGrade = (score: number | null): string => {
//   if (score === null || score <= 0) return "F";
//   if (score >= 90) return "A";
//   if (score >= 80) return "B";
//   if (score >= 70) return "C";
//   if (score >= 60) return "D";
//   return "F";
// };

// export default function ExamDetailPage() {
//   const params = useParams();
//   const examId = params.idExam as string;
//   const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
//   const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

//   const {
//     data: exam,
//     error,
//     mutate,
//   } = useSWR<Exam>(examId ? `/api/exams/${examId}` : null, fetcher);

//   const formMethods = useForm<ExamFormData>({
//     defaultValues: {
//       title: "",
//       description: "",
//       duration: 60,
//       isPublished: false,
//       passingScore: 70,
//     },
//   });

//   const {
//     reset,
//     setValue,
//     handleSubmit,
//     formState: { isDirty, isSubmitting },
//   } = formMethods;

//   React.useEffect(() => {
//     if (exam) {
//       reset({
//         title: exam.title,
//         description: exam.description || "",
//         duration: exam.duration ?? 0,
//         isPublished: exam.isPublished || false,
//         passingScore: exam.data?.passingScore || 70,
//       });
//     }
//   }, [exam, reset]);

//   const onSubmit = async (data: ExamFormData) => {
//     try {
//       const response = await fetch(`/api/exams/${examId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Error al actualizar el examen");
//       }

//       toast.success("Examen actualizado con éxito");
//       await mutate();
//     } catch (err: any) {
//       console.error("Error updating exam:", err);
//       toast.error(err.message || "Error al actualizar examen");
//     }
//   };

//   const handlePublishChange = (checked: boolean) => {
//     setValue("isPublished", checked, { shouldDirty: true });
//   };

//   const handleQuestionAdded = async () => {
//     await mutate();
//     setIsAddQuestionModalOpen(false);
//   };

//   const isLoading = !exam && !error;
//   const isError = !!error;

//   const { data: attemptsData } = useSWR(
//     examId ? `/api/exams/${examId}/attempts` : null,
//     fetcher
//   );

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-gray-200 mb-4"></div>
//           <p>Cargando examen...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-8">
//         <div className="text-center py-8">
//           <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
//           <p>
//             No se pudo cargar el examen. Verifica el ID o intenta de nuevo más
//             tarde.
//           </p>
//           <Button asChild className="mt-4">
//             <Link href="/exams">
//               <ChevronLeft className="w-4 h-4 mr-2" />
//               Volver a la lista de exámenes
//             </Link>
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 space-y-6">
//       <Toaster position="top-right" />

//       <div className="flex justify-between items-center">
//         <div className="flex items-center space-x-4">
//           <Button variant="outline" size="sm" asChild>
//             <Link href="/exams">
//               <ChevronLeft className="w-4 h-4 mr-1" /> Volver
//             </Link>
//           </Button>
//           <h1 className="text-2xl font-bold">{exam?.title}</h1>
//           <span
//             className={`px-2 py-1 text-xs font-semibold rounded-full ${
//               exam?.isPublished
//                 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
//                 : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
//             }`}
//           >
//             {exam?.isPublished ? "Publicado" : "Borrador"}
//           </span>
//         </div>

//         <Button
//           onClick={handleSubmit(onSubmit)}
//           disabled={!isDirty || isSubmitting}
//         >
//           <Save className="w-4 h-4 mr-1" />
//           {isSubmitting ? "Guardando..." : "Guardar Cambios"}
//         </Button>
//       </div>

//       <Separator />

//       <Tabs defaultValue="preguntas" className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="preguntas">
//             <FileQuestion className="w-4 h-4 mr-1" /> Preguntas
//           </TabsTrigger>
//           <TabsTrigger value="detalles">
//             <Settings className="w-4 h-4 mr-1" /> Detalles
//           </TabsTrigger>
//           <TabsTrigger value="intentos">
//             <Users className="w-4 h-4 mr-1" /> Intentos
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="preguntas">
//           <ExamQuestionsTab
//             questions={exam?.questions || []}
//             examId={examId}
//             onQuestionsChange={() => mutate()}
//             onOpenAddModal={() => setIsAddQuestionModalOpen(true)}
//           />
//         </TabsContent>

//         <TabsContent value="detalles">
//           <FormProvider {...formMethods}>
//             <ExamDetailsForm
//               isSubmitting={isSubmitting}
//               isDirty={isDirty}
//               onSubmit={handleSubmit(onSubmit)}
//               isPublished={!!exam?.isPublished}
//               handlePublishChange={handlePublishChange}
//             />
//           </FormProvider>
//         </TabsContent>

//         <TabsContent value="intentos">
//           {attemptsData?.attempts?.length > 0 ? (
//             <div className="space-y-4">
//               {attemptsData.attempts.map((attempt: any) => (
//                 <button
//                   key={attempt.id}
//                   onClick={() => setSelectedAttempt(attempt)}
//                   className="w-full text-left p-4 rounded border bg-white shadow-sm flex justify-between items-center hover:bg-gray-50 transition"
//                 >
//                   <div>
//                     <p className="font-medium">
//                       {attempt.user?.fullName || "Anónimo"}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {attempt.user?.email}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-emerald-600">
//                       {attempt.score != null
//                         ? `${getLetterGrade(attempt.score)} (${attempt.score}%)`
//                         : "F (0%)"}
//                     </p>
//                     <p className="text-sm text-gray-400">
//                       {attempt.submittedAt
//                         ? new Date(attempt.submittedAt).toLocaleString()
//                         : "Sin enviar"}
//                     </p>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
//               <p>No hay intentos registrados para este examen.</p>
//               {!exam?.isPublished && (
//                 <p className="mt-2">
//                   Publica el examen para permitir que los estudiantes lo
//                   realicen.
//                 </p>
//               )}
//             </div>
//           )}

//           {selectedAttempt && (
//             <Dialog open={true} onOpenChange={() => setSelectedAttempt(null)}>
//               <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle>Detalle del intento</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4">
//                   <p>
//                     <strong>Usuario:</strong>{" "}
//                     {selectedAttempt.user?.fullName || "Anónimo"}
//                   </p>
//                   <p>
//                     <strong>Email:</strong> {selectedAttempt.user?.email}
//                   </p>
//                   <p>
//                     <strong>Puntaje:</strong>{" "}
//                     {getLetterGrade(selectedAttempt.score)} (
//                     {selectedAttempt.score ?? 0}%)
//                   </p>
//                   <p>
//                     <strong>Estado:</strong> {selectedAttempt.status}
//                   </p>
//                   <p>
//                     <strong>Fecha de envío:</strong>{" "}
//                     {selectedAttempt.submittedAt
//                       ? new Date(selectedAttempt.submittedAt).toLocaleString()
//                       : "Sin enviar"}
//                   </p>
//                   <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
//                     {JSON.stringify(selectedAttempt.answers, null, 2)}
//                   </pre>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           )}
//         </TabsContent>
//       </Tabs>

//       <AddQuestionModal
//         isOpen={isAddQuestionModalOpen}
//         onOpenChange={setIsAddQuestionModalOpen}
//         examId={examId}
//         onQuestionAdded={handleQuestionAdded}
//       />
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FileQuestion, Save, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";

import AddQuestionModal from "./add/AddQuestionModal";
import ExamQuestionsTab from "./tabs/ExamQuestionsTab";
import ExamDetailsForm from "./tabs/ExamDetailsForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Definiciones de tipos mejoradas
interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "single" | "multiple" | "text";
  options: Option[];
  correctAnswers: string[];
  points: number;
}

interface Exam {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  isPublished?: boolean;
  data?: {
    passingScore?: number;
  };
  questions: Question[];
}

interface ExamAttempt {
  id: string;
  examId: string;
  userId?: string;
  score: number | null;
  status: string;
  submittedAt?: string;
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    textResponse?: string;
  }>;
  user?: {
    fullName: string;
    email: string;
  };
}

interface AttemptsData {
  attempts: ExamAttempt[];
}

// Función para cargar datos con manejo de errores
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar datos");
    return res.json();
  });

// Procesador de exámenes que asegura que todas las preguntas tengan correctAnswers
const examProcessor = (data: Exam): Exam => {
  if (!data || !data.questions) return data;

  // Procesar cada pregunta para asegurar que tenga correctAnswers
  const processedQuestions = data.questions.map((question) => {
    // Si ya tiene correctAnswers y no está vacío, lo mantenemos
    if (question.correctAnswers && question.correctAnswers.length > 0) {
      return question;
    }

    // Si no tiene correctAnswers, lo generamos a partir de las opciones marcadas como correctas
    const correctAnswers = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id);

    console.log(
      `Generando respuestas correctas para pregunta "${question.text}":`,
      correctAnswers
    );

    return {
      ...question,
      correctAnswers,
    };
  });

  return {
    ...data,
    questions: processedQuestions,
  };
};

export type ExamFormData = {
  title: string;
  description?: string;
  duration: number;
  isPublished: boolean;
  passingScore?: number;
};

const getLetterGrade = (score: number | null): string => {
  if (score === null || score <= 0) return "F";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.idExam as string;
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(
    null
  );

  // Cargar y procesar datos del examen
  const {
    data: rawExamData,
    error,
    mutate,
  } = useSWR<Exam>(examId ? `/api/exams/${examId}` : null, fetcher);

  // Procesar el examen para asegurar que todas las preguntas tengan correctAnswers
  const exam = React.useMemo(() => {
    if (!rawExamData) return null;
    return examProcessor(rawExamData);
  }, [rawExamData]);

  // Cargar datos de intentos
  const { data: attemptsData } = useSWR<AttemptsData>(
    examId ? `/api/exams/${examId}/attempts` : null,
    fetcher
  );

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

  // Actualizar el formulario cuando cambian los datos del examen
  React.useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description || "",
        duration: exam.duration ?? 60,
        isPublished: exam.isPublished || false,
        passingScore: exam.data?.passingScore || 70,
      });
    }
  }, [exam, reset]);

  // Guardar cambios en el examen
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

  // Guardar examen procesado con las respuestas correctas
  const handleSaveProcessedExam = async () => {
    try {
      if (!exam) return;

      // Extraer solo las preguntas con sus correctAnswers
      const questionsToUpdate = exam.questions.map((q) => ({
        id: q.id,
        correctAnswers: q.correctAnswers,
      }));

      const response = await fetch(
        `/api/exams/${examId}/questions/update-correct-answers`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: questionsToUpdate }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar las respuestas correctas"
        );
      }

      toast.success("Respuestas correctas actualizadas con éxito");
      await mutate();
    } catch (err: any) {
      console.error("Error updating correct answers:", err);
      toast.error(err.message || "Error al actualizar respuestas correctas");
    }
  };

  const isLoading = !rawExamData && !error;
  const isError = !!error;

  // Indicadores de estado para questions con correctAnswers faltantes
  const hasMissingCorrectAnswers = React.useMemo(() => {
    if (!rawExamData?.questions) return false;
    return rawExamData.questions.some(
      (q) => !q.correctAnswers || q.correctAnswers.length === 0
    );
  }, [rawExamData]);

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
              <ChevronLeft className="w-4 h-4 mr-1" /> Volver
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

        <div className="flex gap-2">
          {hasMissingCorrectAnswers && (
            <Button
              variant="destructive"
              onClick={handleSaveProcessedExam}
              title="Algunas preguntas no tienen respuestas correctas definidas. Haz clic para corregir automáticamente"
            >
              Corregir Respuestas
            </Button>
          )}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {hasMissingCorrectAnswers && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Atención:</strong> Algunas preguntas no tienen
                respuestas correctas definidas. Los alumnos no podrán obtener
                puntos por estas preguntas. Haz clic en "Corregir Respuestas"
                para arreglar automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

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
          {(attemptsData?.attempts ?? []).length > 0 ? (
            <div className="space-y-4">
              {attemptsData?.attempts?.map((attempt: ExamAttempt) => (
                <button
                  key={attempt.id}
                  onClick={() => setSelectedAttempt(attempt)}
                  className="w-full text-left p-4 rounded border bg-white shadow-sm flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium">
                      {attempt.user?.fullName || "Anónimo"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {attempt.user?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {attempt.score != null
                        ? `${getLetterGrade(attempt.score)} (${attempt.score}%)`
                        : "F (0%)"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleString()
                        : "Sin enviar"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No hay intentos registrados para este examen.</p>
              {!exam?.isPublished && (
                <p className="mt-2">
                  Publica el examen para permitir que los estudiantes lo
                  realicen.
                </p>
              )}
            </div>
          )}

          {selectedAttempt && (
            <Dialog open={true} onOpenChange={() => setSelectedAttempt(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalle del intento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    <strong>Usuario:</strong>{" "}
                    {selectedAttempt.user?.fullName || "Anónimo"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedAttempt.user?.email}
                  </p>
                  <p>
                    <strong>Puntaje:</strong>{" "}
                    {getLetterGrade(selectedAttempt.score)} (
                    {selectedAttempt.score ?? 0}%)
                  </p>
                  <p>
                    <strong>Estado:</strong> {selectedAttempt.status}
                  </p>
                  <p>
                    <strong>Fecha de envío:</strong>{" "}
                    {selectedAttempt.submittedAt
                      ? new Date(selectedAttempt.submittedAt).toLocaleString()
                      : "Sin enviar"}
                  </p>

                  <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-medium mb-2">Respuestas:</h3>
                    {selectedAttempt.answers.map((answer, idx) => {
                      const question = exam?.questions.find(
                        (q) => q.id === answer.questionId
                      );
                      return (
                        <div
                          key={idx}
                          className="border-b pb-2 mb-2 last:border-b-0"
                        >
                          <p className="font-medium">
                            {question?.text || `Pregunta ${idx + 1}`}
                          </p>
                          <p className="text-sm">
                            <strong>Opciones seleccionadas:</strong>{" "}
                            {answer.selectedOptionIds.length > 0
                              ? answer.selectedOptionIds
                                  .map((optId) => {
                                    const option = question?.options.find(
                                      (o) => o.id === optId
                                    );
                                    return option?.text || optId;
                                  })
                                  .join(", ")
                              : "Ninguna"}
                          </p>
                          {answer.textResponse && (
                            <p className="text-sm">
                              <strong>Respuesta de texto:</strong>{" "}
                              {answer.textResponse}
                            </p>
                          )}
                          {question && (
                            <p className="text-sm">
                              <strong>Respuestas correctas:</strong>{" "}
                              {question.correctAnswers
                                .map((correctId) => {
                                  const option = question.options.find(
                                    (o) => o.id === correctId
                                  );
                                  return option?.text || correctId;
                                })
                                .join(", ")}
                            </p>
                          )}
                          {question && (
                            <p
                              className={`text-sm ${
                                answer.selectedOptionIds.every((id) =>
                                  question.correctAnswers.includes(id)
                                ) &&
                                question.correctAnswers.every((id) =>
                                  answer.selectedOptionIds.includes(id)
                                )
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <strong>Resultado:</strong>{" "}
                              {answer.selectedOptionIds.every((id) =>
                                question.correctAnswers.includes(id)
                              ) &&
                              question.correctAnswers.every((id) =>
                                answer.selectedOptionIds.includes(id)
                              )
                                ? "Correcto"
                                : "Incorrecto"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
