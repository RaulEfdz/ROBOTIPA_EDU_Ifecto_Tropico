"use client";

import { useState } from "react";
import { useQuizContext } from "../context/QuizContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  BookOpenCheck,
  Clock,
  PlusCircle,
} from "lucide-react";
import { Quiz } from "../types";
import { ScheduleQuizModal } from "./ModalScheduleQuiz";
import { cn } from "@/lib/utils";
import ModalViewer from "@/components/ModalViewer";

export function QuizList() {
  const {
    quizzes,
    setQuiz,
    setViewQuizResponses,
    deleteAQuiz,
    openModal,
    openModalViewResp,
    SetCloseDate,
  } = useQuizContext();

  const [isModalOpen, setModalOpen] = useState(false); // Controla el modal
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null); // Almacena el quiz seleccionado
  const [isModalView, setModalView] = useState<boolean>(false);
  const [idQuizView, setIdQuizView] = useState<string|null>(null)

  const handleDelete = (quizId: string) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este quiz? Esta acción no se puede deshacer."
      )
    ) {
      deleteAQuiz(quizId);
    }
  };

  const handleProgram = (quiz: Quiz) => {
    setCurrentQuiz(quiz); // Establece el quiz seleccionado
    setModalOpen(true); // Abre el modal
    setQuiz(quiz);
  };

  const handleSetProgrammer = (data: { closeDate: { timestamp: number } }) => {
    if (currentQuiz) {
      const timestamp = data.closeDate.timestamp;
      SetCloseDate(timestamp, currentQuiz);
    }
  };
  const now = new Date().getTime();

  return (
    <div className="space-y-6">
      {quizzes.length > 0 ? (
        <div className="rounded-lg border bg-[#FFFCF8] shadow-sm p-6 mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] text-emerald-700">
                  Título
                </TableHead>
                <TableHead className="text-emerald-700">Descripción</TableHead>
                <TableHead className="w-[150px] text-emerald-700">
                  Respuestas
                </TableHead>
                <TableHead className="w-[200px] text-emerald-700">
                  Acciones
                </TableHead>
                <TableHead className="w-[200px] text-emerald-700">
                  Cierre
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id} className="transition duration-200">
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell className="relative text-sm text-gray-500 max-w-[100px] overflow-hidden text-ellipsis break-words whitespace-normal group">
                    <span className="truncate">
                      {quiz.description || "Sin descripción"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => {
                        setQuiz(quiz)
                        openModalViewResp();
                        setViewQuizResponses(quiz);
                      }}
                    >
                      <BookOpenCheck className="h-4 w-4 mr-1" />
                      {quiz.responses?.length || 0} respuestas
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-red-50"
                        onClick={() => {
                          setIdQuizView(quiz.id);
                          setModalView(true);
                        }}
                      >
                        <View className="h-4 w-4 mr-1" />
                        Ver
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => {
                          setQuiz(quiz);
                          openModal();
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border hover:bg-opacity-50",
                        quiz.closeDate?.timestamp
                          ? now > quiz.closeDate.timestamp // Si el tiempo ya pasó, rojo
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : quiz.closeDate.timestamp - now <=
                              24 * 60 * 60 * 1000 // Si quedan menos de 24h, amarillo
                            ? "text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50" // Más de 24h, verde
                          : "text-gray-500 border-gray-200 hover:bg-gray-50" // No programado
                      )}
                      onClick={() => handleProgram(quiz)}
                    >
                      <Clock />
                      {quiz.closeDate?.timestamp
                        ? new Date(quiz.closeDate.timestamp)
                            .toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .replace(",", ",")
                        : ""}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md">
          <p className="text-gray-600 text-lg">No hay quizzes disponibles.</p>
          <Button
            variant="outline"
            className="mt-6 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            onClick={openModal}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear nuevo quiz
          </Button>
        </div>
      )}
      <ScheduleQuizModal
        open={isModalOpen}
        setOpen={setModalOpen}
        setProgrammer={handleSetProgrammer}
      />

      {idQuizView && (
        <ModalViewer
          isOpen={isModalView}
          onClose={() => setModalView(false)}
          id={idQuizView}
          type={"quiz"}
        />
      )}
    </div>
  );
}
