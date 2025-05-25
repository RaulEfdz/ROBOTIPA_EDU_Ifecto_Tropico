"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription as UiCardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Exam,
  getLetterGrade,
  // DetailedAttempt,
  // DetailedAnswer,
} from "../utils/examApi";
import {
  Check,
  X,
  Pencil,
  Save,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";

interface Props {
  exam: Exam;
  attempt: any; // Este es el que recibe la data actualizada
  onClose: () => void;
  onUpdateScore?: (
    attemptId: string,
    newScore: number
  ) => Promise<boolean | void>;
}

export default function AttemptDetailModal({
  exam,
  attempt, // Esta prop se actualiza desde AttemptsTab
  onClose,
  onUpdateScore,
}: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const [isEditingScore, setIsEditingScore] = useState(false);
  // Inicializar scoreInput con el valor de attempt.score, o vacío si es null/undefined
  const [scoreInput, setScoreInput] = useState<string>(
    attempt.score !== null && attempt.score !== undefined
      ? attempt.score.toString()
      : ""
  );
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [currentScore, setCurrentScore] = useState<number>(attempt.score | 0);

  // Sincronizar scoreInput cuando la prop attempt.score (que viene del padre) cambia
  useEffect(() => {
    // Si el modal no está en modo edición y la prop attempt.score cambia,
    // actualizamos el scoreInput para que la próxima vez que entre en modo edición,
    // el valor sea el más reciente.
    // Si ya está en modo edición, el usuario tiene el control del input.
    // Sin embargo, la visualización de la nota (el h3) SIEMPRE leerá de `attempt.score`.
    if (!isEditingScore) {
      setScoreInput(
        attempt.score !== null && attempt.score !== undefined
          ? attempt.score.toString()
          : ""
      );
    }
  }, [attempt.score, isEditingScore]); // Depender también de isEditingScore

  const handleScoreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (
      val === "" || // Permitir campo vacío para borrar
      (/^\d{1,3}$/.test(val) && parseInt(val) >= 0 && parseInt(val) <= 100)
    ) {
      setScoreInput(val);
    }
  };

  const handleSubmitScore = async () => {
    if (!onUpdateScore) return;

    // Validar que scoreInput no esté vacío antes de parsear
    if (scoreInput.trim() === "") {
      toast.error("La calificación no puede estar vacía.");
      return;
    }

    const newScoreValue = parseInt(scoreInput);
    if (isNaN(newScoreValue) || newScoreValue < 0 || newScoreValue > 100) {
      toast.error(
        "Por favor, introduce una calificación válida entre 0 y 100."
      );
      return;
    }

    setIsSubmittingScore(true);
    try {
      setCurrentScore(newScoreValue); // Actualizar la calificación mostrada
      const success = await onUpdateScore(attempt.id, newScoreValue);
      if (success !== false) {
        setIsEditingScore(false); // Salir del modo edición
        // No es necesario llamar a onClose() aquí si el padre lo maneja
        // o si se espera que el usuario cierre manualmente después de ver la actualización.
      }
    } catch (error) {
      console.error(
        "Error al procesar la actualización de calificación:",
        error
      );
      toast.error(
        "Ocurrió un error inesperado al intentar actualizar la calificación."
      );
    } finally {
      setIsSubmittingScore(false);
    }
  };
  // Cuando se sale del modo edición SIN guardar, reseteamos scoreInput al valor actual de attempt.score
  const handleCancelEdit = () => {
    setScoreInput(
      attempt.score !== null && attempt.score !== undefined
        ? attempt.score.toString()
        : ""
    );
    setIsEditingScore(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            Detalle del Intento
            <Badge
              variant={attempt.status === "completed" ? "default" : "secondary"}
            >
              {attempt.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Examen: {exam.title}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden mt-2"
        >
          <TabsList className="grid grid-cols-2 w-full sm:w-auto self-start">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="answers">
              Respuestas ({(attempt.answers || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="general"
            className="flex-1 overflow-y-auto pt-4 space-y-4 custom-scrollbar"
          >
            {/* Información del estudiante */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Información del Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-muted-foreground" />
                  <span>{attempt.user?.fullName || "Usuario Anónimo"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <span>{attempt.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <span>
                    Enviado:{" "}
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString()
                      : "No enviado"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Calificación
                </CardTitle>
                <UiCardDescription>Puntuación (%)</UiCardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                {isEditingScore ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      value={scoreInput}
                      onChange={handleScoreInputChange}
                      className="w-24 h-10 text-lg"
                      min="0"
                      max="100"
                      aria-label="Nueva calificación"
                    />
                    <span className="text-lg font-semibold text-muted-foreground">
                      / 100 %
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    {currentScore && (
                      <h3 className="text-2xl sm:text-3xl font-bold text-primary">
                        {currentScore}
                      </h3>
                    )}
                    {attempt.score !== null && attempt.score !== undefined && (
                      <span className="text-lg font-semibold text-muted-foreground">
                        ({getLetterGrade(attempt.score)})
                      </span>
                    )}
                  </div>
                )}
                {onUpdateScore && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (isEditingScore) {
                              handleSubmitScore();
                            } else {
                              // Al entrar en modo edición, asegurarse que scoreInput tenga el valor actual
                              setScoreInput(
                                attempt.score !== null &&
                                  attempt.score !== undefined
                                  ? attempt.score.toString()
                                  : ""
                              );
                              setIsEditingScore(true);
                            }
                          }}
                          disabled={isSubmittingScore}
                          className="gap-1.5 shrink-0"
                        >
                          {isSubmittingScore ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isEditingScore ? (
                            <Save size={16} />
                          ) : (
                            <Pencil size={16} />
                          )}{" "}
                          {isEditingScore ? "Guardar" : "Editar"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isEditingScore
                            ? "Guardar nueva calificación"
                            : "Editar calificación manualmente"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {/* Botón Cancelar Edición */}
                {isEditingScore && !isSubmittingScore && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="answers"
            className="flex-1 overflow-y-auto pt-4 space-y-3 custom-scrollbar"
          >
            {(attempt.answers || []).length > 0 ? (
              (attempt.answers || []).map(
                (
                  ans: {
                    selectedOptions: any[];
                    textResponse: null;
                    correctOptions: any[];
                    questionId: any;
                    questionText: any;
                  },
                  idx: number
                ) => {
                  const isTextQ =
                    !(ans.selectedOptions && ans.selectedOptions.length > 0) &&
                    ans.textResponse != null;
                  let isAnsCorrect = false;
                  if (!isTextQ && ans.correctOptions && ans.selectedOptions) {
                    const correctIds = ans.correctOptions
                      .map((o) => o.id)
                      .sort();
                    const selectedIds = ans.selectedOptions
                      .map((o: { id: any }) => o.id)
                      .sort();
                    isAnsCorrect =
                      JSON.stringify(correctIds) ===
                      JSON.stringify(selectedIds);
                  }
                  return (
                    <Card
                      key={
                        ans.questionId
                          ? `${ans.questionId}_${idx}`
                          : `answer_${idx}`
                      }
                      className={`border-l-4 ${
                        isTextQ
                          ? "border-emerald-500"
                          : isAnsCorrect
                            ? "border-green-500"
                            : "border-red-500"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm sm:text-base font-semibold">
                            Pregunta {idx + 1}
                          </CardTitle>
                          <Badge
                            variant={
                              isTextQ
                                ? "outline"
                                : isAnsCorrect
                                  ? "default"
                                  : "destructive"
                            }
                            className={`text-xs ${
                              isTextQ
                                ? ""
                                : isAnsCorrect
                                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600"
                                  : ""
                            } `}
                          >
                            {isTextQ ? (
                              "Respuesta Abierta"
                            ) : isAnsCorrect ? (
                              <>
                                <Check size={14} className="mr-1" />
                                Correcta
                              </>
                            ) : (
                              <>
                                <X size={14} className="mr-1" />
                                Incorrecta
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {ans.questionText ||
                            "Texto de pregunta no disponible"}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-1 text-xs sm:text-sm">
                        {isTextQ ? (
                          <div>
                            <strong className="font-medium">
                              Respuesta del estudiante:
                            </strong>
                            <p className="pl-2 mt-0.5 bg-slate-50 dark:bg-slate-800 p-2 rounded border dark:border-slate-700 whitespace-pre-wrap">
                              {ans.textResponse || <em>Sin respuesta</em>}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p>
                              <strong className="font-medium">
                                Seleccionadas:
                              </strong>{" "}
                              {ans.selectedOptions &&
                              ans.selectedOptions.length > 0 ? (
                                ans.selectedOptions
                                  .map((o) => o.text)
                                  .join(" | ")
                              ) : (
                                <em>Ninguna</em>
                              )}
                            </p>
                            <p>
                              <strong className="font-medium">
                                Correctas:
                              </strong>{" "}
                              {ans.correctOptions &&
                              ans.correctOptions.length > 0 ? (
                                ans.correctOptions
                                  .map((o) => o.text)
                                  .join(" | ")
                              ) : (
                                <em>N/A</em>
                              )}
                            </p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <p>
                  No hay respuestas detalladas disponibles para este intento.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t mt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
