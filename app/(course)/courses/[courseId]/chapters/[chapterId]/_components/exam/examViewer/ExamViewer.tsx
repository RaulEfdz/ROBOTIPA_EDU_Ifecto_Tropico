"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import CertificateCard from "./certi/CertificateCard";
import PreCertificateCard from "./certi/PreCertificateCard";
import {
  useProcessAndSubmitExam,
  QuestionType,
  type Exam,
  type Question,
} from "./examSubmit";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ExamViewer({
  onScore,
  isCompleted,
  nextChapterId,
}: {
  onScore?: (score: number) => void;
  isCompleted: boolean;
  nextChapterId?: string;
}) {
  const { courseId, chapterId } = useParams() as {
    courseId: string;
    chapterId: string;
  };

  const { submit: processAndSubmit, isLoading } = useProcessAndSubmitExam();
  const { user } = useCurrentUser();

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [open, setOpen] = useState(false);
  const [isFetchingExam, setIsFetchingExam] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (open) setAnswers({});
  }, [open]);

  useEffect(() => {
    async function fetchExam() {
      if (!courseId || !chapterId) return;
      setIsFetchingExam(true);
      try {
        const res = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/exam/current`
        );
        const { exam: current } = await res.json();
        if (!current?.id) {
          setExam(null);
          return;
        }
        const fullRes = await fetch(`/api/exams/${current.id}`);
        if (!fullRes.ok) {
          const errorData = await fullRes.json();
          throw new Error(
            errorData.error ||
              `Error al cargar detalles del examen: ${fullRes.status}`
          );
        }
        const data: Exam = await fullRes.json();
        if (data.questions) {
          data.questions = data.questions.map((q: Question) => ({
            ...q,
            type: Object.values(QuestionType).includes(q.type)
              ? q.type
              : QuestionType.SINGLE,
            correctAnswers:
              q.correctAnswers && q.correctAnswers.length
                ? q.correctAnswers
                : q.options.filter((o) => o.isCorrect).map((o) => o.id),
          }));
        }
        setExam(data);
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Error al cargar examen.");
        setExam(null);
      } finally {
        setIsFetchingExam(false);
      }
    }
    fetchExam();
  }, [courseId, chapterId]);

  const handleRadioChange = (qid: string, optId: string) =>
    setAnswers((p) => ({ ...p, [qid]: optId }));
  const handleCheckboxChange = (
    qid: string,
    optId: string,
    checked: boolean
  ) => {
    setAnswers((prev) => {
      const sel = (prev[qid] as string[]) || [];
      return {
        ...prev,
        [qid]: checked ? [...sel, optId] : sel.filter((id) => id !== optId),
      };
    });
  };
  const handleTextChange = (qid: string, txt: string) =>
    setAnswers((p) => ({ ...p, [qid]: txt }));

  const handleSubmit = async () => {
    if (!exam) return;
    const ok = await processAndSubmit({
      exam,
      userAnswers: answers,
      courseId,
      chapterId,
      nextChapterId,
      isChapterAlreadyCompleted: isCompleted,
      onScoreCallback: onScore,
    });
    if (ok) setOpen(false);
  };

  if (isFetchingExam && !exam)
    return (
      <Button disabled className="mb-4" aria-live="polite">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando Examen...
      </Button>
    );

  if (!exam || !exam.questions.length)
    return (
      <Button disabled className="mb-4">
        Examen no disponible
      </Button>
    );

  return (
    <>
      {!isCompleted ? (
        <Button className="w-full" onClick={() => setOpen(true)}>
          Realizar Examen
        </Button>
      ) : (
        <>
          <Button
            className="w-full"
            onClick={() => setShowCertificateModal(true)}
          >
            Ya terminé
          </Button>
          <Dialog
            open={showCertificateModal}
            onOpenChange={setShowCertificateModal}
          >
            <DialogContent className="w-[900px] h-[600px] bg-white shadow-lg rounded-md flex justify-center items-center">
              <DialogFooter className="w-full flex flex-col justify-center">
                <PreCertificateCard
                  name={user?.fullName || user?.email || "Usuario"}
                />

                <Button onClick={() => setShowCertificateModal(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              {exam?.title}
            </DialogTitle>
            {exam?.description && (
              <DialogDescription className="text-sm text-muted-foreground pt-1">
                {exam.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            {exam?.questions.map((q, i) => {
              const selected = (answers[q.id] as string[]) || [];
              const maxSel =
                q.type === QuestionType.MULTIPLE && q.correctAnswers.length > 0
                  ? q.correctAnswers.length
                  : 1;
              const reached =
                q.type === QuestionType.MULTIPLE &&
                selected.length >= maxSel &&
                maxSel > 0;
              return (
                <Card
                  key={q.id}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      Pregunta {i + 1}:{" "}
                      <span className="font-normal">{q.text}</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Puntos: {q.points}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {q.type === QuestionType.SINGLE && (
                      <RadioGroup
                        value={(answers[q.id] as string) || ""}
                        onValueChange={(v) => handleRadioChange(q.id, v)}
                        className="space-y-1"
                      >
                        {q.options.map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          >
                            <RadioGroupItem
                              value={o.id}
                              id={`${q.id}-${o.id}`}
                            />
                            <Label
                              htmlFor={`${q.id}-${o.id}`}
                              className="font-normal text-sm cursor-pointer flex-1"
                            >
                              {o.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {q.type === QuestionType.MULTIPLE && (
                      <div className="space-y-1">
                        {maxSel > 0 && (
                          <p className="text-xs text-muted-foreground mb-2">
                            (Selecciona hasta {maxSel}{" "}
                            {maxSel === 1 ? "opción" : "opciones"})
                          </p>
                        )}
                        {q.options.map((o) => {
                          const sel = selected.includes(o.id);
                          const dis = !sel && reached && maxSel > 0;
                          return (
                            <div
                              key={o.id}
                              className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                                dis
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-accent cursor-pointer"
                              }`}
                            >
                              <Checkbox
                                id={`${q.id}-${o.id}`}
                                checked={sel}
                                disabled={dis}
                                onCheckedChange={(c) => {
                                  if (dis && c) return;
                                  handleCheckboxChange(q.id, o.id, !!c);
                                }}
                              />
                              <Label
                                htmlFor={`${q.id}-${o.id}`}
                                className={`font-normal text-sm flex-1 ${
                                  dis ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                              >
                                {o.text}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.type === QuestionType.TEXT && (
                      <Textarea
                        className="w-full border rounded p-2 min-h-[100px] text-sm"
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <DialogFooter className="pt-6 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                "Enviar respuestas"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
