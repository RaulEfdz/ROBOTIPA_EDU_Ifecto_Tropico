// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useConfettiStore } from "@/hooks/use-confetti-store";
// import { toast } from "sonner";

// interface Option {
//   id: string;
//   text: string;
//   isCorrect?: boolean;
// }

// interface Question {
//   id: string;
//   text: string;
//   type: "single" | "multiple" | "text";
//   options: Option[];
//   correctAnswers: string[];
//   points: number;
// }

// interface Exam {
//   id: string;
//   title: string;
//   description?: string;
//   questions: Question[];
// }

// const getLetterGrade = (score: number): string => {
//   if (score <= 0) return "F";
//   if (score >= 90) return "A";
//   if (score >= 80) return "B";
//   if (score >= 70) return "C";
//   if (score >= 60) return "D";
//   return "F";
// };

// // Función corregida para evaluar correctamente las respuestas
// const isAnswerCorrect = (
//   q: Question,
//   userAnswer: string | string[] | undefined
// ) => {
//   // Si no hay respuesta del usuario
//   if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
//     return false;
//   }

//   // Convertir la respuesta del usuario a un arreglo para poder comparar
//   const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

//   // Para preguntas de tipo "single", solo debería haber una respuesta correcta
//   if (q.type === "single") {
//     return q.correctAnswers.includes(userAnswerArray[0]);
//   }

//   // Para preguntas de tipo "multiple", verificamos que todas las respuestas coincidan
//   // Usando arrays en lugar de Sets para evitar problemas de compatibilidad con TypeScript

//   // Verificar que ambos arrays tengan el mismo tamaño
//   if (q.correctAnswers.length !== userAnswerArray.length) return false;

//   // Verificar que cada respuesta correcta esté en las respuestas del usuario
//   return q.correctAnswers.every((correctAnswer) =>
//     userAnswerArray.includes(correctAnswer)
//   );
// };

// export default function ExamViewer({
//   onScore,
//   isCompleted,
//   nextChapterId,
// }: {
//   onScore?: (score: number) => void;
//   isCompleted: boolean;
//   nextChapterId?: string;
// }) {
//   const { courseId, chapterId } = useParams() as {
//     courseId: string;
//     chapterId: string;
//   };

//   const router = useRouter();
//   const confetti = useConfettiStore();

//   const [exam, setExam] = useState<Exam | null>(null);
//   const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     const fetchExam = async () => {
//       try {
//         const res = await fetch(
//           `/api/courses/${courseId}/chapters/${chapterId}/exam/current`
//         );
//         const json = await res.json();
//         if (json.exam) {
//           const fullExam = await fetch(`/api/exams/${json.exam.id}`);
//           const examData = await fullExam.json();
//           setExam(examData);
//         }
//       } catch (error) {
//         console.error("Error al obtener el examen:", error);
//       }
//     };
//     fetchExam();
//   }, [courseId, chapterId]);

//   const handleChange = (question: Question, value: string) => {
//     const { id, type } = question;
//     setAnswers((prev) => {
//       if (type === "multiple") {
//         const prevAnswers = (prev[id] as string[]) || [];
//         const updated = prevAnswers.includes(value)
//           ? prevAnswers.filter((v) => v !== value)
//           : [...prevAnswers, value];
//         return { ...prev, [id]: updated };
//       } else {
//         return { ...prev, [id]: value };
//       }
//     });
//   };

//   const calculateScore = () => {
//     if (!exam) return 0;
//     let total = 0;
//     let earned = 0;

//     exam.questions.forEach((q) => {
//       total += q.points;
//       const userAnswer = answers[q.id];

//       // Saltar preguntas de tipo texto (no se evalúan automáticamente)
//       if (q.type === "text") return;

//       // Comprobar si la respuesta es correcta
//       if (isAnswerCorrect(q, userAnswer)) {
//         earned += q.points;
//       }

//       // Registro para depuración
//       console.log({
//         pregunta: q.text,
//         tipo: q.type,
//         correctas: q.correctAnswers,
//         enviadas: Array.isArray(userAnswer)
//           ? userAnswer
//           : userAnswer
//           ? [userAnswer]
//           : [],
//         esCorrecta: isAnswerCorrect(q, userAnswer),
//         puntos: isAnswerCorrect(q, userAnswer) ? q.points : 0,
//       });
//     });

//     // Evitar división por cero
//     const score = total === 0 ? 0 : Math.round((earned / total) * 100);
//     console.log(
//       `Puntos obtenidos: ${earned}/${total} - Calificación: ${score}%`
//     );

//     return score;
//   };

//   const markChapterAsCompleted = async () => {
//     try {
//       const res = await fetch(
//         `/api/courses/${courseId}/chapters/${chapterId}/progress`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ isCompleted: true }),
//         }
//       );
//       if (!res.ok) throw new Error("Error al completar el capítulo");
//       confetti.onOpen();
//       toast.success("🎉 Capítulo completado con éxito");

//       await new Promise((resolve) => setTimeout(resolve, 3000));

//       if (nextChapterId) {
//         router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
//       } else {
//         router.push(`/courses/${courseId}`);
//       }
//     } catch (err) {
//       console.error("Error al marcar como completado:", err);
//       toast.error("Error al marcar el capítulo como completado");
//     }
//   };

//   const handleSubmit = async () => {
//     if (!exam) return;
//     try {
//       const score = calculateScore();

//       console.log("Resumen de respuestas:");
//       console.log({
//         totalQuestions: exam.questions.length,
//         answeredQuestions: Object.keys(answers).length,
//         score: score,
//       });

//       const response = await fetch("/api/exam-attempts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           examId: exam.id,
//           score,
//           answers: Object.entries(answers).map(([questionId, value]) => {
//             const question = exam.questions.find((q) => q.id === questionId);
//             return {
//               questionId,
//               selectedOptionIds: Array.isArray(value)
//                 ? value
//                 : value
//                 ? [value]
//                 : [],
//               textResponse:
//                 question?.type === "text" && typeof value === "string"
//                   ? value
//                   : "",
//             };
//           }),
//         }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         toast.success(
//           `Examen enviado correctamente 🎉 Calificación: ${getLetterGrade(
//             score
//           )} (${score}%)`
//         );
//         if (onScore) onScore(score);

//         if (score >= 70 && !isCompleted) {
//           await markChapterAsCompleted();
//         }

//         setOpen(false);
//       } else {
//         toast.error("Error al enviar el examen: " + result.error);
//       }
//     } catch (error) {
//       console.error("Error al enviar:", error);
//       toast.error("Error inesperado al enviar el examen");
//     }
//   };

//   if (!exam) return null;

//   return (
//     <>
//       <Button onClick={() => setOpen(true)} className="mb-4">
//         Realizar Examen
//       </Button>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{exam.title}</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-6">
//             {exam.description && (
//               <p className="text-slate-600">{exam.description}</p>
//             )}

//             {exam.questions.map((question) => (
//               <div key={question.id} className="border p-4 rounded shadow-sm">
//                 <p className="font-medium mb-2">{question.text}</p>
//                 {question.type === "text" ? (
//                   <textarea
//                     className="w-full border rounded p-2"
//                     onChange={(e) => handleChange(question, e.target.value)}
//                   />
//                 ) : (
//                   question.options.map((option) => (
//                     <label key={option.id} className="block">
//                       <input
//                         type={question.type === "single" ? "radio" : "checkbox"}
//                         name={question.id}
//                         value={option.id}
//                         checked={
//                           question.type === "single"
//                             ? answers[question.id] === option.id
//                             : (answers[question.id] as string[])?.includes(
//                                 option.id
//                               )
//                         }
//                         onChange={() => handleChange(question, option.id)}
//                         className="mr-2"
//                       />
//                       {option.text}
//                     </label>
//                   ))
//                 )}
//               </div>
//             ))}
//           </div>
//           <DialogFooter className="pt-4">
//             <Button onClick={handleSubmit}>Enviar respuestas</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { toast } from "sonner";

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
  questions: Question[];
}

const getLetterGrade = (score: number): string => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const isAnswerCorrect = (
  question: Question,
  userAnswer: string | string[] | undefined
): boolean => {
  if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
    return false;
  }

  const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

  if (question.type === "single") {
    return question.correctAnswers.includes(userAnswers[0]);
  }

  if (question.correctAnswers.length !== userAnswers.length) return false;

  return question.correctAnswers.every((ans) => userAnswers.includes(ans));
};

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

  const router = useRouter();
  const confetti = useConfettiStore();

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/exam/current`
        );
        const json = await res.json();

        if (!json.exam) return;

        const fullExamRes = await fetch(`/api/exams/${json.exam.id}`);
        const examData = await fullExamRes.json();

        if (examData?.questions) {
          examData.questions = examData.questions.map((q: Question) => ({
            ...q,
            correctAnswers:
              q.correctAnswers && q.correctAnswers.length > 0
                ? q.correctAnswers
                : q.options.filter((opt) => opt.isCorrect).map((opt) => opt.id),
          }));
        }

        setExam(examData);
      } catch (error) {
        console.error("Error al obtener el examen:", error);
      }
    };

    fetchExam();
  }, [courseId, chapterId]);

  const handleChange = (question: Question, value: string) => {
    setAnswers((prev) => {
      const prevVal = prev[question.id];
      if (question.type === "multiple") {
        const current = Array.isArray(prevVal) ? prevVal : [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [question.id]: updated };
      }

      return { ...prev, [question.id]: value };
    });
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let total = 0;
    let earned = 0;

    for (const question of exam.questions) {
      if (question.type === "text") continue;

      total += question.points;

      const userAnswer = answers[question.id];
      if (isAnswerCorrect(question, userAnswer)) {
        earned += question.points;
      }
    }

    return total === 0 ? 0 : Math.round((earned / total) * 100);
  };

  const markChapterAsCompleted = async () => {
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: true }),
        }
      );
      if (!res.ok) throw new Error("Error al completar el capítulo");

      confetti.onOpen();
      toast.success("🎉 Capítulo completado con éxito");

      await new Promise((resolve) => setTimeout(resolve, 3000));
      router.push(
        nextChapterId
          ? `/courses/${courseId}/chapters/${nextChapterId}`
          : `/courses/${courseId}`
      );
    } catch (err) {
      console.error(err);
      toast.error("No se pudo marcar el capítulo como completado");
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;

    const score = calculateScore();

    try {
      const res = await fetch("/api/exam-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          score,
          answers: Object.entries(answers).map(([id, val]) => {
            const question = exam.questions.find((q) => q.id === id);
            return {
              questionId: id,
              selectedOptionIds: Array.isArray(val) ? val : val ? [val] : [],
              textResponse:
                question?.type === "text" && typeof val === "string" ? val : "",
            };
          }),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        return toast.error("Error al enviar el examen: " + result.error);
      }

      toast.success(
        `Examen enviado 🎉 Calificación: ${getLetterGrade(score)} (${score}%)`
      );

      onScore?.(score);

      if (score >= 70 && !isCompleted) {
        await markChapterAsCompleted();
      }

      setOpen(false);
    } catch (err) {
      console.error("Error al enviar el examen:", err);
      toast.error("Error inesperado al enviar el examen");
    }
  };

  if (!exam) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} className="mb-4">
        Realizar Examen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{exam.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {exam.description && (
              <p className="text-slate-600">{exam.description}</p>
            )}
            {exam.questions.map((question) => (
              <div key={question.id} className="border p-4 rounded shadow-sm">
                <p className="font-medium mb-2">{question.text}</p>
                {question.type === "text" ? (
                  <textarea
                    className="w-full border rounded p-2"
                    onChange={(e) => handleChange(question, e.target.value)}
                  />
                ) : (
                  question.options.map((option) => (
                    <label key={option.id} className="block">
                      <input
                        type={question.type === "single" ? "radio" : "checkbox"}
                        name={question.id}
                        value={option.id}
                        checked={
                          question.type === "single"
                            ? answers[question.id] === option.id
                            : (answers[question.id] as string[])?.includes(
                                option.id
                              )
                        }
                        onChange={() => handleChange(question, option.id)}
                        className="mr-2"
                      />
                      {option.text}
                    </label>
                  ))
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4">
            <Button onClick={handleSubmit}>Enviar respuestas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
