// File: AttemptDetailModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Exam, ExamAttempt, getLetterGrade } from "../utils/examApi";
import {
  Check,
  X,
  Pencil,
  Save,
  AlertCircle,
  User,
  Mail,
  Calendar,
} from "lucide-react";

interface Props {
  exam: Exam;
  attempt: ExamAttempt;
  onClose: () => void;
  onUpdateScore?: (attemptId: string, newScore: number) => Promise<void>;
}

export default function AttemptDetailModal({
  exam,
  attempt,
  onClose,
  onUpdateScore,
}: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [scoreInput, setScoreInput] = useState((attempt.score ?? 0).toString());
  const [submitting, setSubmitting] = useState(false);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^$|^\d{1,3}$/.test(val) && +val <= 100) {
      setScoreInput(val);
    }
  };

  const submitScore = async () => {
    if (!onUpdateScore) return;
    setSubmitting(true);
    await onUpdateScore(attempt.id, parseInt(scoreInput) || 0);
    setIsEditing(false);
    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            Detalle del Intento <Badge>{attempt.status}</Badge>
          </DialogTitle>
          {/* <DialogClose /> */}
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="answers">
              Respuestas ({attempt.answers?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 overflow-auto pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Estudiante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={18} /> {attempt.user?.fullName}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} /> {attempt.user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />{" "}
                  {attempt.submittedAt
                    ? new Date(attempt.submittedAt).toLocaleString()
                    : "Sin enviar"}
                </div>
              </CardContent>
            </Card>

            <Separator className="my-4" />

            <Card>
              <CardHeader>
                <CardTitle>Calificación</CardTitle>
                <CardDescription>Puntuación (%)</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={scoreInput}
                      onChange={handleScoreChange}
                      className="w-20"
                    />
                    <span>/100</span>
                  </div>
                ) : (
                  <h3 className="text-2xl font-bold">
                    {attempt.score}% ({getLetterGrade(attempt.score)})
                  </h3>
                )}

                {onUpdateScore && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            isEditing ? submitScore() : setIsEditing(true)
                          }
                          disabled={submitting}
                          className="gap-1"
                        >
                          {isEditing ? (
                            <Save size={16} />
                          ) : (
                            <Pencil size={16} />
                          )}
                          {isEditing ? "Guardar" : "Editar"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isEditing
                            ? "Guardar nueva calificación"
                            : "Editar calificación manualmente"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="answers"
            className="flex-1 overflow-auto pt-4 space-y-4"
          >
            {(attempt.answers || []).map((ans, idx) => {
              const q = exam.questions.find((x) => x.id === ans.questionId);
              const correct =
                ans.selectedOptionIds?.every((id) =>
                  q?.correctAnswers.includes(id)
                ) && q?.correctAnswers.length === ans.selectedOptionIds.length;

              return (
                <Card
                  key={idx}
                  className={
                    correct ? "border-l-green-500" : "border-l-red-500"
                  }
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>Pregunta {idx + 1}</CardTitle>
                      <Badge variant={correct ? "secondary" : "destructive"}>
                        {correct ? <Check /> : <X />}{" "}
                        {correct ? "Correcta" : "Incorrecta"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">{q?.text}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Seleccionadas:</strong>{" "}
                        {ans.selectedOptionIds?.length
                          ? ans.selectedOptionIds.join(", ")
                          : "Ninguna"}
                      </p>
                      {ans.textResponse && (
                        <p>
                          <strong>Texto:</strong> {ans.textResponse}
                        </p>
                      )}
                      <p>
                        <strong>Correctas:</strong>{" "}
                        {q?.correctAnswers.join(", ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {(!attempt.answers || attempt.answers.length === 0) && (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <AlertCircle size={48} className="mb-4" />
                <p>No hay respuestas registradas.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
