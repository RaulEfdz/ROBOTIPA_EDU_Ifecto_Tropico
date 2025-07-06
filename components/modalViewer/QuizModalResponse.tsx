// "use client";
// import React, { useState, useEffect } from "react";
// // import { Quiz } from "@/app/(dashboard)/(routes)/exams/types";
// // import { COLLECTION_QUIZZES } from "@/app/(dashboard)/(routes)/exams/context/QuizContext";
// import { handleSubmitQuiz } from "./handleSubmitQuiz";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { AlertCircle } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useForm } from "react-hook-form";
// import { SkeletonCard } from "../SkeletonCard";
// import {
//   formatQuestionsInText,
//   formatText,
//   formatTimestamp,
// } from "@/utils/formatTextMS";
// import QuizResults from "./QuizResults";
// import ExpiredQuizResults from "./ExpiredQuizResults";
// import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
// // import { getQuizzes } from "@/app/(dashboard)/(routes)/exams/handler/getQuizzes";

// interface Props {
//   id: string;
//   onClose: () => void;
// }

// interface FormValues {
//   [key: string]: boolean;
// }

// interface resultType {
//   message: string;
//   ok: boolean;
// }

// const QuizModalResponse: React.FC<Props> = ({ id, onClose }) => {
//   const [quizData, setQuizData] = useState<Quiz | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [scorePercentage, setScorePercentage] = useState<number | null>(null);
//   const [grade, setGrade] = useState<string | null>(null);
//   const [isResponse, setIsResponse] = useState<boolean>(false);
//   const [isExist, setExist] = useState<boolean>(false);

//   const form = useForm<FormValues>({
//     defaultValues: {},
//   });

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const user = await getCurrentUserFromDB();
//         if (user && user.id) {
//           setUserId(user.id);
//         } else {
//           setError("Sesión de usuario no disponible.");
//         }
//       } catch (err: any) {
//         setError(err.message || "Error al cargar el usuario.");
//       }
//     };

//     fetchUser();
//   }, []);

//   useEffect(() => {
//     const fetchQuiz = async () => {
//       try {
//         setLoading(true);
//         const idSplit = id.split("_&!")[1];
//         const quiz: Quiz = await getQuizzes(COLLECTION_QUIZZES);
//         setQuizData(quiz);
//         setExist(
//           quiz.closeDate?.timestamp
//             ? new Date(quiz.closeDate.timestamp) > new Date()
//             : false
//         );

//         form.reset(
//           quiz.questions.reduce((acc, question) => {
//             acc[question.id] = false;
//             return acc;
//           }, {} as FormValues)
//         );
//       } catch (err: any) {
//         setError(err.message || "Error al cargar el quiz.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchQuiz();
//   }, [id, form]);

//   useEffect(() => {
//     if (quizData?.responses && userId) {
//       const hasUserResponded = quizData.responses.some((response) => {
//         if (response.userId === userId) {
//           setGrade(String(response.score));
//           return true;
//         }
//       });

//       setIsResponse(hasUserResponded);
//     }
//   }, [quizData, userId]);

//   const getGradeFromPercentage = (percentage: number): string => {
//     if (percentage >= 91) return "A";
//     if (percentage >= 81) return "B";
//     if (percentage >= 71) return "C";
//     if (percentage >= 61) return "D";
//     return "F";
//   };

//   const onSubmit = async (data: FormValues) => {
//     if (!quizData || !userId) return;

//     const correctAnswers = quizData.questions.reduce(
//       (acc, q) => acc + (data[q.id] === q.correctAnswers ? 1 : 0),
//       0
//     );

//     const totalQuestions = quizData.questions.length;
//     const percentage = Math.round((correctAnswers / totalQuestions) * 100);
//     const assignedGrade = getGradeFromPercentage(percentage);

//     setScorePercentage(percentage);
//     setGrade(assignedGrade);
//     const result: any = await handleSubmitQuiz(id, userId, percentage, data);
//     if (result.ok) {
//       setIsResponse(true);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[85vh] bg-primary-300">
//         <SkeletonCard />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <Alert variant="destructive">
//         <AlertCircle className="h-4 w-4" />
//         <AlertDescription>{error}</AlertDescription>
//       </Alert>
//     );
//   }

//   if (!quizData) {
//     return (
//       <Alert>
//         <AlertCircle className="h-4 w-4" />
//         <AlertDescription>No se encontró el quiz.</AlertDescription>
//       </Alert>
//     );
//   }

//   return (
//     <div className="max-w-screen-lg ">
//       {isResponse && quizData.responses ? (
//         <QuizResults
//           isExist={isExist}
//           quizData={{
//             quizData,
//             questions: quizData.questions,
//             title: quizData.title,
//             description: quizData.description || "", // Usa un valor por defecto si está vacío
//           }}
//           isResponse={true}
//           userAnswers={quizData.responses}
//         />
//       ) : (
//         <>
//           {isExist ? (
//             <Card className="w-full h-full max-h-[80vh] overflow-auto max-w-screen-lg">
//               <CardHeader className="space-y-2 bg-zinc-50 border-b justify-center">
//                 <CardTitle className="text-2xl font-bold text-zinc-900 w-full text-center">
//                   {formatText(quizData.title)}
//                 </CardTitle>
//                 <CardDescription className="text-sm text-zinc-600 w-full text-center">
//                   {quizData.description}

//                   <div className="space-y-1">
//                     <span className="font-bold tracking-tight text-green-600">
//                       Quiz cierra el{" "}
//                       {quizData.closeDate &&
//                         formatTimestamp(quizData.closeDate?.timestamp)}
//                     </span>
//                   </div>
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <Form {...form}>
//                   <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className="space-y-8"
//                   >
//                     {quizData.questions.map((question, index) => (
//                       <FormField
//                         key={question.id}
//                         control={form.control}
//                         name={question.id}
//                         render={({ field }) => (
//                           <FormItem className="space-y-4">
//                             <div className="flex items-center space-x-2">
//                               <span className="text-sm font-medium text-zinc-500">
//                                 Pregunta {index + 1}
//                               </span>
//                               <Separator className="flex-1" />
//                             </div>
//                             <FormLabel className="font-bold text-lg text-left text-black">
//                               {formatQuestionsInText(question.question)}
//                             </FormLabel>
//                             <FormControl>
//                               <RadioGroup
//                                 className="grid grid-cols-2 gap-4 w-[300px]"
//                                 value={field.value ? "true" : "false"}
//                                 onValueChange={(value) =>
//                                   field.onChange(value === "true")
//                                 }
//                               >
//                                 <div className="relative">
//                                   <div
//                                     className={`absolute inset-0 rounded-lg transition-all duration-200 ${
//                                       field.value
//                                         ? "bg-primary-50 border-2 border-green-500"
//                                         : "hover:bg-gray-50"
//                                     }`}
//                                   />
//                                   <div className="relative flex items-center space-x-3 p-3">
//                                     <RadioGroupItem
//                                       value="true"
//                                       id={`${question.id}-true`}
//                                       className={
//                                         field.value ? "text-green-500" : ""
//                                       }
//                                     />
//                                     <Label
//                                       htmlFor={`${question.id}-true`}
//                                       className={`text-sm font-medium cursor-pointer ${
//                                         field.value
//                                           ? "text-green-700"
//                                           : "text-gray-700"
//                                       }`}
//                                     >
//                                       Verdadero
//                                     </Label>
//                                   </div>
//                                 </div>
//                                 <div className="relative">
//                                   <div
//                                     className={`absolute inset-0 rounded-lg transition-all duration-200 ${
//                                       !field.value
//                                         ? "bg-red-50 border-2 border-red-500"
//                                         : "hover:bg-gray-50"
//                                     }`}
//                                   />
//                                   <div className="relative flex items-center space-x-3 p-3">
//                                     <RadioGroupItem
//                                       value="false"
//                                       id={`${question.id}-false`}
//                                       className={
//                                         !field.value ? "text-red-500" : ""
//                                       }
//                                     />
//                                     <Label
//                                       htmlFor={`${question.id}-false`}
//                                       className={`text-sm font-medium cursor-pointer ${
//                                         !field.value
//                                           ? "text-red-700"
//                                           : "text-gray-700"
//                                       }`}
//                                     >
//                                       Falso
//                                     </Label>
//                                   </div>
//                                 </div>
//                               </RadioGroup>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     ))}
//                     <Button type="submit" className="w-full">
//                       Enviar respuestas
//                     </Button>
//                   </form>
//                 </Form>
//               </CardContent>
//             </Card>
//           ) : (
//             <ExpiredQuizResults quizData={quizData} isExpired={true} />
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default QuizModalResponse;
