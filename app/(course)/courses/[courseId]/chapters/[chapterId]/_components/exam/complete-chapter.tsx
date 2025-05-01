// // File: app/(course)/courses/[courseId]/chapters/[chapterId]/_components/exam/complete-chapter.ts

// "use client";

// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { useConfettiStore } from "@/hooks/use-confetti-store";

// interface Params {
//   score: number;
//   courseId: string;
//   chapterId: string;
//   nextChapterId?: string;
//   isCompleted: boolean;
// }

// export async function handleExamCompletion({
//   score,
//   courseId,
//   chapterId,
//   nextChapterId,
//   // isCompleted,
// }: Params) {
//   const confetti = useConfettiStore.getState();
//   const router = useRouter();

//   if (score < 70 || isCompleted) return;

//   try {
//     const res = await fetch(
//       `/api/courses/${courseId}/chapters/${chapterId}/progress`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isCompleted: true }),
//       }
//     );

//     if (!res.ok) {
//       throw new Error("No se pudo marcar como completado");
//     }

//     confetti.onOpen();
//     toast.success("🎉 Capítulo marcado como completado");
//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     if (nextChapterId) {
//       router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
//     } else {
//       router.push(`/courses/${courseId}`);
//     }
//   } catch (err) {
//     console.error("Error al marcar capítulo como completado:", err);
//     toast.error("Error al completar el capítulo");
//   }
// }
