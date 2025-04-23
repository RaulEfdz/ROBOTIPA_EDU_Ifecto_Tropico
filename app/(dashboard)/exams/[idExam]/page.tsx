"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import {
  ChevronLeft,
  Save,
  Plus,
  Clock,
  FileQuestion,
  Users,
  Settings,
} from "lucide-react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Exam, Question } from "@/prisma/types";

// Define the Exam type with the missing property

import QuestionsList from "./QuestionsList";
import AddQuestionModal from "./AddQuestionModal";

// Fetcher para SWR
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar datos");
    return res.json();
  });

// Tipo para los datos del formulario
type ExamFormData = {
  title: string;
  description?: string;
  duration: number;
  isPublished: boolean;
  passingScore?: number;
};

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.idExam as string;

  // Estado para el modal de agregar pregunta
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  // Obtener datos del examen
  const {
    data: exam,
    error,
    mutate,
  } = useSWR<Exam>(examId ? `/api/exams/${examId}` : null, fetcher);

  // Formulario para editar examen
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
  } = useForm<ExamFormData>({
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      isPublished: false,
      passingScore: 70,
    },
  });

  // Actualizar el formulario cuando se carguen los datos
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

  // Manejar el guardado del formulario
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
      await mutate(); // Actualizar los datos
    } catch (err: any) {
      console.error("Error updating exam:", err);
      toast.error(err.message || "Error al actualizar examen");
    }
  };

  // Manejar cambio en el switch de publicación
  const handlePublishChange = (checked: boolean) => {
    setValue("isPublished", checked, { shouldDirty: true });
  };

  // Manejar cuando se agrega una nueva pregunta
  const handleQuestionAdded = async () => {
    await mutate();
    setIsAddQuestionModalOpen(false);
  };

  // Estados de carga y error
  const isLoading = !exam && !error;
  const isError = !!error;

  // Renderizar estados de carga o error
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

      {/* Cabecera */}
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

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsAddQuestionModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir Pregunta
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Contenido principal con pestañas */}
      <Tabs defaultValue="preguntas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preguntas">
            <FileQuestion className="w-4 h-4 mr-1" />
            Preguntas
          </TabsTrigger>
          <TabsTrigger value="detalles">
            <Settings className="w-4 h-4 mr-1" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="intentos">
            <Users className="w-4 h-4 mr-1" />
            Intentos
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Preguntas */}
        <TabsContent value="preguntas">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas del Examen</CardTitle>
              <CardDescription>
                Gestiona las preguntas de este examen. Añade, edita o elimina
                preguntas según sea necesario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionsList
                questions={exam?.questions || []}
                examId={examId}
                onQuestionsChange={() => mutate()}
              />

              {(!exam?.questions || exam.questions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FileQuestion className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay preguntas en este examen.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddQuestionModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir primera pregunta
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Total de preguntas: {exam?.questions?.length || 0}
              </div>
              {exam?.questions && exam.questions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddQuestionModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Pregunta
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Detalles */}
        <TabsContent value="detalles">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Examen</CardTitle>
              <CardDescription>
                Configura los detalles básicos de este examen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      {...register("title", {
                        required: "El título es requerido",
                      })}
                      placeholder="Ej: Examen de Historia"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Duración */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <div className="flex items-center">
                      <Input
                        id="duration"
                        type="number"
                        {...register("duration", {
                          required: "La duración es requerida",
                          min: {
                            value: 1,
                            message: "La duración mínima es 1 minuto",
                          },
                          valueAsNumber: true,
                        })}
                      />
                      <Clock className="w-4 h-4 ml-2 text-gray-500" />
                    </div>
                    {errors.duration && (
                      <p className="text-red-500 text-sm">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  {/* Nota de aprobación */}
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Nota de aprobación (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      {...register("passingScore", {
                        min: {
                          value: 0,
                          message: "La nota mínima debe ser 0",
                        },
                        max: {
                          value: 100,
                          message: "La nota máxima debe ser 100",
                        },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.passingScore && (
                      <p className="text-red-500 text-sm">
                        {errors.passingScore.message}
                      </p>
                    )}
                  </div>

                  {/* Publicación */}
                  <div className="space-y-2">
                    <Label htmlFor="isPublished">Estado de Publicación</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublished"
                        checked={exam?.isPublished || false}
                        onCheckedChange={handlePublishChange}
                      />
                      <Label htmlFor="isPublished" className="cursor-pointer">
                        {exam?.isPublished ? "Publicado" : "Borrador"}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {exam?.isPublished
                        ? "El examen está disponible para los estudiantes."
                        : "El examen está en modo borrador y no es visible para los estudiantes."}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    placeholder="Describe brevemente este examen..."
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={!isDirty || isSubmitting}
                className="ml-auto"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Intentos */}
        <TabsContent value="intentos">
          <Card>
            <CardHeader>
              <CardTitle>Intentos de Examen</CardTitle>
              <CardDescription>
                Visualiza los intentos realizados por los estudiantes en este
                examen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exam?.attempts && exam.attempts.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  {/* Aquí iría la tabla de intentos */}
                  <p className="p-4">Tabla de intentos se implementará aquí</p>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para agregar preguntas */}
      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onOpenChange={setIsAddQuestionModalOpen}
        examId={examId}
        onQuestionAdded={handleQuestionAdded}
      />
    </div>
  );
}
